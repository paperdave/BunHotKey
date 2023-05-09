import { oneTickFetch } from "./cache";
import { ffi } from "./lib";
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

const getActiveWindow = () => new WindowRef(ffi.get_active_window());
const getHoveredWindow = () => new WindowRef(ffi.get_window_at_mouse());
const getMousePos = () => {
  ffi.get_mouse_location(buffer_ptr);
  return new MousePos(buffer[0], buffer[1], buffer[2]);
};

export const ui = {
  get activeWindow() {
    return oneTickFetch(getActiveWindow);
  },
  get hoveredWindow() {
    return oneTickFetch(getHoveredWindow);
  },
  mouse: {
    get pos(): MousePos {
      return oneTickFetch(getMousePos);
    },
    set pos(pos: { x?: number; y?: number; screen?: number }) {
      ffi.move_mouse(pos.x ?? ui.mouse.pos.x, pos.y ?? ui.mouse.pos.y, 0);
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
