import { FFIType, JSCallback, Pointer } from "bun:ffi";
import { ffi } from "./lib";
import { encodeText } from "./shared";
import { Timer } from "@paperdave/utils";
import EventEmitter from "events";
import { EventDeviceType, Key } from "./input-enum";
import { Ref } from "./ref";

enum KeyPressType {
  up = 0,
  down = 1,
  repeat = 2,
}

export class EventDevice {
  #id: Pointer;
  #cb: JSCallback;
  #ref: Ref;
  #ee = new EventEmitter();

  constructor(device: string, grab = true) {
    if (!device.startsWith("/dev/input/")) {
      device = "/dev/input/" + device;
      if (!device.startsWith("/dev/input/event")) {
        throw new Error("Invalid device path");
      }
    }

    this.#cb = new JSCallback(
      (type, code, value) => this.#onData(type, code, value),
      {
        args: [FFIType.u16, FFIType.u16, FFIType.i32],
        returns: "void",
        threadsafe: true,
      }
    );
    this.#id = ffi.jsevdev_init(encodeText(device) as any, grab, this.#cb.ptr!);
    if (this.#id === 0) {
      this.#cb.close();
      throw new Error("Failed to init external device reader");
    }
    this.#ref = new Ref();
  }

  addListener(
    event: "key",
    listener: (key: { code: Key; type: keyof KeyPressType }) => void
  ) {
    this.#ee.addListener(event, listener);
  }

  #onData(type: number, code: number, value: number) {
    switch (type) {
      case EventDeviceType.KEY:
        this.#ee.emit("key", { code, type: KeyPressType[value] });
        break;

      default:
        console.error("unhandled evdev:", { type, code, value });
        break;
    }
  }

  dispose() {
    ffi.jsevdev_dispose(this.#id);
    this.#cb.close();
    clearInterval(this.#ref);
  }
}
