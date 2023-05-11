import { FFIType, JSCallback, Pointer } from "bun:ffi";
import { ffi } from "./lib";
import { encodeText } from "./shared";
import EventEmitter from "events";
import { EventDeviceEventType, Key } from "./input-enum";
import { Ref } from "./ref";
import { getInputDevices } from "./device-reader";

enum KeyPressType {
  up = 0,
  down = 1,
  repeat = 2,
}

type EventDeviceOpts = (
  | {
      device: string;
    }
  | {
      product: number;
      vendor: number;
    }
) & {
  grab?: boolean;
};

/**
 * Class representing an event device, like a keyboard. Pass grab=true to grab the device
 */
export class EventDevice {
  #id: Pointer;
  #cb: JSCallback;
  #ref: Ref;
  #ee = new EventEmitter();

  constructor(opts: EventDeviceOpts) {
    let device;

    if ("product" in opts && "vendor" in opts) {
      const dev = getInputDevices().find((dev) => {
        console.log(dev.info);
        return (
          Number("0x" + dev.info.vendor) === opts.vendor &&
          Number("0x" + dev.info.product) === opts.product
        );
      });
      if (!dev) {
        throw new Error("No matching device found");
      }
      device = dev.handlers.find((handler) => handler.startsWith("event"));
      if (!device) {
        throw new Error("No matching device found");
      }
    } else {
      device = opts.device;
    }

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
    this.#id = ffi.EventDevice.init(
      encodeText(device) as any,
      !!opts.grab,
      this.#cb.ptr!
    );
    if (this.#id === 0) {
      this.#cb.close();
      throw new Error("Failed to init external device reader");
    }
    this.#ref = new Ref();
  }

  on(
    event: "key",
    listener: (key: { code: Key; type: keyof KeyPressType }) => void
  ) {
    this.#ee.addListener(event, listener);
  }

  #onData(type: number, code: number, value: number) {
    switch (type) {
      case EventDeviceEventType.KEY:
        this.#ee.emit("key", { code, type: KeyPressType[value] });
        break;

      default:
        console.debug("unhandled evdev:", { type, code, value });
        break;
    }
  }

  dispose() {
    ffi.EventDevice.deinit(this.#id);
    this.#cb.close();
    this.#ref.unref();
  }
}
