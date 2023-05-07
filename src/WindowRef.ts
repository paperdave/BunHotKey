import { ProcessRef } from "./ProcessRef";
import { buffer, buffer_ptr, encodeText } from "./shared";
import * as ffi from "./ffi";

export type WindowID = number | bigint;

class WindowPos {
  #id: WindowID;
  #x: number;
  #y: number;
  constructor(id: WindowID, x: number, y: number) {
    this.#id = id;
    this.#x = x;
    this.#y = y;
  }
  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }
  set x(x: number) {
    this.#x = x;
    ffi.move_window(this.#id, this.#x, this.#y);
  }
  set y(y: number) {
    this.#y = y;
    ffi.move_window(this.#id, this.#x, this.#y);
  }
}
class WindowSize {
  #id: WindowID;
  #w: number;
  #h: number;
  constructor(id: WindowID, x: number, y: number) {
    this.#id = id;
    this.#w = x;
    this.#h = y;
  }
  get width() {
    return this.#w;
  }
  get height() {
    return this.#h;
  }
  set width(x: number) {
    this.#w = x;
    ffi.move_window(this.#id, this.#w, this.#h);
  }
  set height(y: number) {
    this.#h = y;
    ffi.move_window(this.#id, this.#w, this.#h);
  }
}

export class WindowRef {
  constructor(readonly id: WindowID) {}

  get pid() {
    return ffi.get_window_pid(this.id);
  }

  get proc() {
    const pid = this.pid;
    if (!pid) return null;
    return new ProcessRef(this.pid);
  }

  get name() {
    return "" + ffi.get_window_name(this.id);
  }

  get pos(): WindowPos {
    ffi.get_window_location(this.id, buffer_ptr);
    return new WindowPos(this.id, buffer[0], buffer[1]);
  }

  set pos(pos: { x?: number; y?: number; screen?: number }) {
    const ref = this.pos;
    ffi.move_window(this.id, pos.x ?? ref.x, pos.y ?? ref.y);
  }

  get size(): WindowSize {
    ffi.get_window_size(this.id, buffer_ptr);
    return new WindowSize(this.id, buffer[0], buffer[1]);
  }

  set size(size: { width?: number; height?: number }) {
    const ref = this.size;
    ffi.set_window_size(
      this.id,
      size.width ?? ref.width,
      size.height ?? ref.height,
      0
    );
  }

  get x() {
    ffi.get_window_location(this.id, buffer_ptr);
    return buffer[0];
  }

  set x(x: number) {
    ffi.get_window_location(this.id, buffer_ptr);
    ffi.move_window(this.id, x, buffer[1]);
  }

  get y() {
    ffi.get_window_location(this.id, buffer_ptr);
    return buffer[1];
  }

  set y(y: number) {
    ffi.get_window_location(this.id, buffer_ptr);
    ffi.move_window(this.id, buffer[0], y);
  }

  get width() {
    ffi.get_window_size(this.id, buffer_ptr);
    return buffer[0];
  }

  set width(width: number) {
    ffi.get_window_size(this.id, buffer_ptr);
    ffi.set_window_size(this.id, width, buffer[1], 0);
  }

  get height() {
    ffi.get_window_size(this.id, buffer_ptr);
    return buffer[1];
  }

  set height(height: number) {
    ffi.get_window_size(this.id, buffer_ptr);
    ffi.set_window_size(this.id, buffer[0], height, 0);
  }

  kill() {
    ffi.kill_window(this.id);
  }

  close() {
    ffi.close_window(this.id);
  }

  quit() {
    ffi.quit_window(this.id);
  }

  click(button: number) {
    ffi.click_window(this.id, button);
  }

  clickMultiple(button: number, times: number, delay = 1) {
    ffi.click_window_multiple(this.id, button, times, delay * 1000);
  }

  type(text: string, delay = 0) {
    ffi.enter_text_window(this.id, encodeText(text) as any, delay * 1000);
  }
}
