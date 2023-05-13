import { ffi } from "@ffi";
import { encodeText, oneTickFetch, returnBuf, returnPtr } from "@shared";
import { ptr } from "bun:ffi";
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
    ffi.xdo.moveMouse(this.#x, this.#y, this.#screen);
  }
  set y(y: number) {
    this.#y = y;
    ffi.xdo.moveMouse(this.#x, this.#y, this.#screen);
  }
  set screen(screen: number) {
    this.#screen = screen;
    ffi.xdo.moveMouse(this.#x, this.#y, this.#screen);
  }
}

interface FindWindowOptions {
  class?: string;
  className?: string;
  name?: string;
  role?: string;
  maxDepth?: number;
  pid?: number;
  onlyVisible?: boolean;
  /**
   * defaults to AND
   */
  filter?: "AND" | "OR";
}
interface FindWindowMultipleOptions extends FindWindowOptions {
  limit?: number;
}

const null_buffer = encodeText("null");
const null_ptr = ptr(null_buffer.buffer);

function findWindowMultiple({
  class: _class,
  className,
  name,
  role,
  maxDepth,
  pid,
  onlyVisible,
  filter,
  limit = 100,
}: FindWindowMultipleOptions): WindowRef[] {
  let mask = 0;
  if (_class) mask |= 1 << 1;
  if (name) mask |= 1 << 2;
  if (pid) mask |= 1 << 3;
  if (onlyVisible !== undefined) mask |= 1 << 4;
  if (className) mask |= 1 << 6;
  if (role) mask |= 1 << 8;

  if (limit <= 0) throw new Error("limit must be greater than 0");
  if (limit > 10000) throw new Error("limit must be less than 10000");

  if (limit === 1) {
    const win = ffi.xdo.searchWindowSingle(
      mask,
      filter === "OR" ? 1 : 0,
      _class ? encodeText(_class) : (null_ptr as any),
      className ? encodeText(className) : (null_ptr as any),
      name ? encodeText(name) : (null_ptr as any),
      role ? encodeText(role) : (null_ptr as any),
      maxDepth ?? 1,
      pid ?? 0,
      !!onlyVisible
    );
    if (!win) return [];
    return [new WindowRef(win)];
  } else {
    const buffer = new BigUint64Array(limit);
    const n = ffi.xdo.searchWindowMultiple(
      mask,
      filter === "OR" ? 1 : 0,
      _class ? encodeText(_class) : (null_ptr as any),
      className ? encodeText(className) : (null_ptr as any),
      name ? encodeText(name) : (null_ptr as any),
      role ? encodeText(role) : (null_ptr as any),
      maxDepth ?? 1,
      pid ?? 0,
      !!onlyVisible,
      ptr(buffer.buffer),
      limit
    );
    if (n === 0) return [];
    return Array.from(buffer.slice(0, n)).map((id) => new WindowRef(id));
  }
}

const getActiveWindow = () => new WindowRef(ffi.xdo.getActiveWindow());
const getHoveredWindow = () => new WindowRef(ffi.xdo.getWindowAtMouse());
const getMousePos = () => {
  ffi.xdo.getMouseLocation(returnPtr);
  return new MousePos(returnBuf[0], returnBuf[1], returnBuf[2]);
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
      ffi.xdo.moveMouse(pos.x ?? ui.mouse.pos.x, pos.y ?? ui.mouse.pos.y, 0);
    },
    moveTo(x: number, y: number, screen = 0) {
      ffi.xdo.moveMouse(x, y, screen);
    },
    moveBy(x: number, y: number) {
      ffi.xdo.moveMouseRelative(x, y);
    },
    // moveRelativeToWindow(window: WindowRef, x: number, y: number) {
    //   ffi.xdo.moveMouseRelativeToWindow(window.id, x, y);
    // },
    down(button: number) {
      ffi.xdo.mouseDown(0, button);
    },
    up(button: number) {
      ffi.xdo.mouseUp(0, button);
    },
    click(button: number) {
      ffi.xdo.clickWindow(0, button);
    },
  },
  findWindow(opts: FindWindowOptions): WindowRef | null {
    return findWindowMultiple({ ...opts, limit: 1 })[0] ?? null;
  },
  filterWindows(opts: FindWindowMultipleOptions) {
    return findWindowMultiple(opts);
  },
};
