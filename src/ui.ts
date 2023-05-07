import * as ffi from "./ffi";
import { buffer, buffer_ptr } from "./shared";
import { WindowRef } from "./WindowRef";

class MousePos {
  #x: number;
  #y: number;
  #screen: number;
  constructor(x: number, y: number, screen: number) {
    this.#x = x;
    this.#y = y;
    this.#screen = screen;
  }
  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }
  get screen() {
    return this.#screen;
  }
  set x(x: number) {
    this.#x = x;
    ffi.move_mouse(this.#x, this.#y, this.#screen);
  }
  set y(y: number) {
    this.#y = y;
    ffi.move_mouse(this.#x, this.#y, this.#screen);
  }
  set screen(screen: number) {
    this.#screen = screen;
    ffi.move_mouse(this.#x, this.#y, this.#screen);
  }
}

export const ui = {
  get activeWindow() {
    return new WindowRef(ffi.get_active_window());
  },
  get hoveredWindow() {
    return new WindowRef(ffi.get_window_at_mouse());
  },
  mouse: {
    get pos(): MousePos {
      ffi.get_mouse_location(buffer_ptr);
      return new MousePos(buffer[0], buffer[1], buffer[2]);
    },
    set pos(pos: { x?: number; y?: number; screen?: number }) {
      const ref = ui.mouse.pos;
      ffi.move_mouse(pos.x ?? ref.x, pos.y ?? ref.y, pos.screen ?? ref.screen);
    },
    moveTo(x: number, y: number, screen = 0) {
      ffi.move_mouse(x, y, screen);
    },
    moveRelative(x: number, y: number) {
      ffi.move_mouse_relative(x, y);
    },
    moveRelativeToWindow(window: WindowRef, x: number, y: number) {
      ffi.move_mouse_relative_to_window(window.id, x, y);
    },
    down(button: number) {
      ffi.mouse_down(0, button);
    },
    up(button: number) {
      ffi.mouse_up(0, button);
    },
  },
};