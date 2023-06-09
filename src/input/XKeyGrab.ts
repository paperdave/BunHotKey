import { ffi } from "@ffi";
import { Ref } from "@shared";
import { FFIType, JSCallback, Pointer } from "bun:ffi";
import { WindowID, WindowRef } from "../ui/WindowRef";

const Mod2Mask = 1 << 1;

export interface KeyGrabEvent {
  // type: number;
  key: number;
  modifiers: number;
  window: WindowRef;
  subwindow: WindowRef;
  pos: { x: number; y: number };
  /** milliseconds relative to start of X11 */
  time: number;
}

const callback = new JSCallback(
  (
    type: number,
    window: WindowID,
    subwindow: WindowID,
    x: number,
    y: number,
    time: number,
    key: number,
    modifiers: number
  ) => {
    const hash = (key << 8) + (modifiers & ~Mod2Mask);
    const m = map.get(window);
    if (m) {
      const xkeygrab = m.get(hash);
      if (xkeygrab) {
        xkeygrab.callback({
          key,
          modifiers,
          get window() {
            return new WindowRef(window);
          },
          get subwindow() {
            return new WindowRef(subwindow);
          },
          pos: { x, y },
          // time,
        });
      }
    }
  },
  {
    args: [
      FFIType.int,
      FFIType.u64_fast,
      FFIType.u64_fast,
      FFIType.int,
      FFIType.int,
      FFIType.u32,
      FFIType.u64_fast,
      FFIType.u64_fast,
    ],
    threadsafe: true,
  }
);

ffi.XKeyGrab.setCallback(callback.ptr!);

const map = new Map<WindowID, Map<number, XKeyGrab>>();

export class XKeyGrab {
  #hash: number;
  #ptr: Pointer;
  #ref: Ref;
  readonly key: number;
  readonly modifiers: number;
  readonly window: WindowID = 0;
  readonly callback: (event: any) => void;

  constructor(
    options: { key: number; modifiers: number; window?: WindowID | WindowRef },
    callback: (event: any) => void
  ) {
    let { key, modifiers, window = 0 } = options;
    if (typeof window === "object") {
      window = window.id;
    }
    const hash = (key << 8) + (modifiers & ~Mod2Mask);
    const m = map.get(window);
    if (!m) {
      map.set(window, new Map([[hash, this]]));
    } else {
      if (m.has(hash)) {
        throw new Error(
          "XKeygrab already exists for this key and modifier combination."
        );
      }
    }

    this.#ptr = ffi.XKeyGrab.add(key, modifiers, window);
    if (!this.#ptr) {
      throw new Error("Failed to create XKeyGrab");
    }

    this.#hash = hash;
    this.key = key;
    this.modifiers = modifiers;
    this.window = window;
    this.callback = callback;
    this.#ref = new Ref();
  }

  dispose() {
    const m = map.get(this.window);
    if (m) {
      m.delete(this.#hash);
      if (m.size === 0) {
        map.delete(this.window);
      }
    }
    ffi.XKeyGrab.dispose(this.#ptr);
    this.#ref.unref();
  }
}
