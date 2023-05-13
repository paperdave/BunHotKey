import { ArrayBufferSink } from "bun";
import { decodeText, encodeText } from "../shared";
import { Socket } from "bun";
import EventEmitter from "events";
import { deferred } from "@paperdave/utils";
import {
  I3Config,
  I3EventType,
  I3Events,
  I3MessageType,
  I3TreeNode,
  I3Version,
  I3Workspace,
  PayloadBuffer,
} from "./i3-types";
import { I3WorkspaceRef, i3GetWorkspaces } from "./I3WorkspaceRef";

const responseQueue: ((data: any) => void)[] = [];

let socket: Socket | null = null;
let socketPromise: Promise<void> | null = null;
async function ensureI3Socket() {
  if (socketPromise) return socketPromise;
  if (!socket) {
    let [promise, resolve] = deferred<void>();
    socketPromise = promise;

    const pathname =
      process.env.I3_SOCKET_PATH ??
      Bun.spawnSync(["i3", "--get-socketpath"]).stdout.toString().trim();

    socket = (await Bun.connect({
      unix: pathname,
      socket: {
        data(socket, data) {
          // setTimeout(() => {
          let type = data.readUint32LE(10);
          const payload = data.subarray(14);
          const jsonDecoded = JSON.parse(decodeText(payload));
          // if first bit is 1, its an event
          if (type >= 0x80000000) {
            type = type - 0x80000000;
            i3["ee"].emit(I3EventType[type], jsonDecoded);
          } else {
            responseQueue.shift()?.(jsonDecoded);
          }
        },

        close() {
          socket = null;
          console.log("Socket closed");
        },
      },
    })) as any as Socket;
    resolve();
  }
}

const sink = new ArrayBufferSink();
const header = new Uint8Array([0x69, 0x33, 0x2d, 0x69, 0x70, 0x63]);
const startPart = new Uint32Array([0, 0]);
sink.start({ stream: true, highWaterMark: 1024 });

function encodePayload(
  payload: string | object | PayloadBuffer
): PayloadBuffer {
  if (
    Object.getPrototypeOf(payload) === Object.prototype ||
    Array.isArray(payload)
  ) {
    return encodeText(JSON.stringify(payload));
  }
  if (typeof payload === "string") {
    return encodeText(payload);
  }
  return payload as TypedArray | DataView | ArrayBuffer | SharedArrayBuffer;
}

async function send(
  type: I3MessageType,
  payload?: string | object | PayloadBuffer
) {
  if (!socket) await ensureI3Socket();
  startPart[1] = type;
  sink.write(header);
  if (payload) {
    const payloadBuffer = encodePayload(payload);
    startPart[0] = payloadBuffer.byteLength;
    sink.write(startPart);
    sink.write(payloadBuffer);
  } else {
    startPart[0] = 0;
    sink.write(startPart);
  }
  const message = sink.flush() as ArrayBuffer;
  socket!.write(message);
  socket!.flush();
}

function requestI3<T>(type: I3MessageType, payload?: string | object) {
  return new Promise<T>((resolve) => {
    responseQueue.push(resolve);
    send(type, payload);
  });
}

export async function getWorkspaces() {
  return await requestI3<I3Workspace[]>(I3MessageType.GET_WORKSPACES);
}

export async function getTree() {
  return await requestI3<I3TreeNode>(I3MessageType.GET_TREE);
}

export async function getMarks() {
  return await requestI3<string[]>(I3MessageType.GET_MARKS);
}

export async function getVersion(): Promise<I3Version> {
  return await requestI3<I3Version>(I3MessageType.GET_VERSION);
}

export async function getBindingModes() {
  return await requestI3<string[]>(I3MessageType.GET_BINDING_MODES);
}

export async function getConfig() {
  return await requestI3<I3Config>(I3MessageType.GET_CONFIG);
}

export async function sendTick(payload: string | object | PayloadBuffer) {
  const x = await requestI3<{ success: boolean }>(
    I3MessageType.SEND_TICK,
    payload
  );
  if (!x.success) {
    throw new Error("Tick failed");
  }
}

export async function sync(windowId: number, rnd: number) {
  const x = await requestI3<{ success: boolean }>(
    I3MessageType.SYNC,
    `${windowId}:${rnd}`
  );
  if (!x.success) {
    throw new Error("Sync failed");
  }
}

export async function getBindingState() {
  return await requestI3<{ name: string }>(I3MessageType.GET_BINDING_STATE);
}

class LazyI3Instance {
  async exec(command: string) {
    const results = await requestI3<Array<{ success: boolean }>>(
      I3MessageType.RUN_COMMAND,
      command
    );
    if (results.some((result) => !result.success)) {
      throw new Error("Command failed: " + JSON.stringify(results));
    }
  }

  get workspaces() {
    return getWorkspaces();
  }

  workspace(name: string): I3WorkspaceRef {
    return (
      i3GetWorkspaces().find(
        (wksp) => wksp.num === name || wksp.name === name || wksp.id === name
      ) ?? null
    );
  }

  private eventList: string[] = [];
  private ee = new EventEmitter();
  addListener<T extends keyof I3Events>(
    event: T,
    listener: (...args: I3Events[T]) => void
  ): this {
    this.ee.addListener(event, listener as any);
    if (!this.eventList.includes(event)) {
      requestI3(I3MessageType.SUBSCRIBE, [event]);
      this.eventList.push(event);
    }
    return this;
  }

  on<T extends keyof I3Events>(
    event: T,
    listener: (...args: I3Events[T]) => void
  ): this {
    return this.addListener(event, listener);
  }

  once<T extends keyof I3Events>(
    event: T,
    listener: (...args: I3Events[T]) => void
  ): this {
    this.ee.once(event, listener as any);
    if (!this.eventList.includes(event)) {
      requestI3(I3MessageType.SUBSCRIBE, [event]);
      this.eventList.push(event);
    }
    return this;
  }

  removeListener<T extends keyof I3Events>(
    event: T,
    listener: (...args: I3Events[T]) => void
  ): this {
    this.ee.removeListener(event, listener as any);
    // its not possible to unsub
    // if (!this.#ee.listeners(event).length) {
    //   requestI3(I3MessageType.UNSUBSCRIBE, [event]);
    //   this.#i3Events = this.#i3Events.filter((e) => e !== event);
    // }
    return this;
  }

  off<T extends keyof I3Events>(
    event: T,
    listener: (...args: I3Events[T]) => void
  ): this {
    return this.removeListener(event, listener);
  }

  removeAllListeners<T extends keyof I3Events>(event?: T): this {
    if (event) {
      this.ee.removeAllListeners(event);
      // its not possible to unsub
      // requestI3(I3MessageType.UNSUBSCRIBE, [event]);
      // this.#i3Events = this.#i3Events.filter((e) => e !== event);
    } else {
      this.ee.removeAllListeners();
      // its not possible to unsub
      // requestI3(I3MessageType.UNSUBSCRIBE, this.#i3Events);
      // this.#i3Events = [];
    }
    return this;
  }

  listeners<T extends keyof I3Events>(event: T): Function[] {
    return this.ee.listeners(event);
  }

  rawListeners<T extends keyof I3Events>(event: T): Function[] {
    return this.ee.rawListeners(event);
  }

  listenerCount<T extends keyof I3Events>(event: T): number {
    return this.ee.listenerCount(event);
  }
}

export const i3 = new LazyI3Instance();
