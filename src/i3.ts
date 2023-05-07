import { ArrayBufferSink } from "bun";
import { decodeText, encodeText } from "./shared";
import { Socket } from "bun";
import EventEmitter from "events";
import { deferred } from "@paperdave/utils";

const responseQueue: ((data: any) => void)[] = [];

type PayloadBuffer = TypedArray | DataView | ArrayBuffer | SharedArrayBuffer;

enum I3MessageType {
  RUN_COMMAND = 0,
  GET_WORKSPACES = 1,
  SUBSCRIBE = 2,
  GET_OUTPUTS = 3,
  GET_TREE = 4,
  GET_MARKS = 5,
  GET_BAR_CONFIG = 6,
  GET_VERSION = 7,
  GET_BINDING_MODES = 8,
  GET_CONFIG = 9,
  SEND_TICK = 10,
  SYNC = 11,
  GET_BINDING_STATE = 12,
}
enum I3EventType {
  workspace = 0,
  output = 1,
  mode = 2,
  window = 3,
  barconfig_update = 4,
  binding = 5,
  shutdown = 6,
  tick = 7,
}
enum I3FullscreenMode {
  NONE = 0,
  SCREEN = 1,
  GLOBAL = 2,
}

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

export interface I3Version {
  major: number;
  minor: number;
  patch: number;
  human_readable: string;
  loaded_config_file_name: string;
  included_config_file_names: string[];
}

export interface I3Workspace {
  id: number;
  num: number;
  name: string;
  visible: boolean;
  focused: boolean;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  output: string;
  urgent: boolean;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** https://i3wm.org/docs/ipc.html#_tree_reply */
export interface I3TreeNode {
  id: number;
  type: "root" | "output" | "con" | "floating_con" | "workspace" | "dockarea";
  border: "normal" | "none" | "pixel";
  orientation: "horizontal";
  scratchpad_state: "none";
  percent: null | number;
  urgent: boolean;
  marks: string[];
  focused: boolean;
  layout: "splith" | "splitv" | "stacked" | "tabbed" | "dockarea";
  workspace_layout: "default";
  last_split_layout: "splith" | "splitv" | "stacked" | "tabbed" | "dockarea";
  current_border_width: number;
  rect: Rect;
  deco_rect: Rect;
  window_rect: Rect;
  geometry: Rect;
  name: string;
  window_icon_padding: number;
  window: number | null;
  window_type: null;
  window_properties?: {
    title: string;
    instance: string;
    class: string;
    transient_for: string;
    window_role: string;
    machine: string;
  };
  nodes: I3TreeNode[];
  floating_nodes: I3TreeNode[];
  focus: number[];
  fullscreen_mode: I3FullscreenMode;
  sticky: boolean;
  floating: "auto_off" | "auto_on" | "user_off" | "user_on";
  swallows: [];
}

export interface I3Config {
  config: string;
  included_configs: {
    path: string;
    raw_contents: string;
    variable_replaced_contents: string;
  }[];
}

interface I3Events {
  workspace: [I3WorkspaceEvent];
  output: [I3OutputEvent];
  mode: [I3ModeEvent];
  window: [I3WindowEvent];
  // barconfig_update: [I3BarConfig];
  binding: [I3BindingEvent];
  shutdown: [I3ShutdownEvent];
  tick: [I3TickEvent];
}

export interface I3WorkspaceEvent {
  change: "focus" | "init" | "empty" | "urgent";
  current: I3Workspace;
  old: I3Workspace;
}

export interface I3OutputEvent {
  change: "unspecified";
}

export interface I3ModeEvent {
  change: string;
  pango_markup: string;
}

export interface I3WindowEvent {
  change:
    | "new"
    | "close"
    | "focus"
    | "title"
    | "fullscreen_mode"
    | "move"
    | "floating"
    | "urgent"
    | "mark";
  container: I3TreeNode;
}

export interface I3BindingEvent {
  change: "run";
  binding: {
    command: string;
    event_state_mask: string[];
    input_code: number;
    symbol: string;
    input_type: "keyboard" | "mouse";
  };
}

export interface I3ShutdownEvent {
  change: "restart" | "exit";
}

export interface I3TickEvent {
  first: boolean;
  payload: string;
}

class LazyI3Instance {
  async runCommand(command: string) {
    const results = await requestI3<Array<{ success: boolean }>>(
      I3MessageType.RUN_COMMAND,
      command
    );
    if (results.some((result) => result.success)) {
      throw new Error("Command failed: " + JSON.stringify(results));
    }
  }

  async getWorkspaces() {
    return await requestI3<I3Workspace[]>(I3MessageType.GET_WORKSPACES);
  }

  async getTree() {
    return await requestI3<I3TreeNode>(I3MessageType.GET_TREE);
  }

  async getMarks() {
    return await requestI3<string[]>(I3MessageType.GET_MARKS);
  }

  async getVersion(): Promise<I3Version> {
    return await requestI3<I3Version>(I3MessageType.GET_VERSION);
  }

  async getBindingModes() {
    return await requestI3<string[]>(I3MessageType.GET_BINDING_MODES);
  }

  async getConfig() {
    return await requestI3<I3Config>(I3MessageType.GET_CONFIG);
  }

  async sendTick(payload: string | object | PayloadBuffer) {
    const x = await requestI3<{ success: boolean }>(
      I3MessageType.SEND_TICK,
      payload
    );
    if (!x.success) {
      throw new Error("Tick failed");
    }
  }

  async sync(windowId: number, rnd: number) {
    const x = await requestI3<{ success: boolean }>(
      I3MessageType.SYNC,
      `${windowId}:${rnd}`
    );
    if (!x.success) {
      throw new Error("Sync failed");
    }
  }

  async getBindingState() {
    return await requestI3<{ name: string }>(I3MessageType.GET_BINDING_STATE);
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

  eventNames() {
    return this.eventList as (keyof I3Events)[];
  }
}

export const i3 = new LazyI3Instance();
