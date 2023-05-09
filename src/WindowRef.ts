import { ProcessRef } from "./ProcessRef";
import { OneTickCache, oneTickDelete, oneTickGet, oneTickSet } from "./cache";
import { ffi } from "./lib";
import { buffer, buffer_ptr, encodeText } from "./shared";

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

  #pid: number | null = null;
  get pid() {
    return this.#pid ?? (this.#pid = ffi.get_window_pid(this.id));
  }

  #proc: ProcessRef | null | undefined = undefined;
  get proc() {
    if (this.#proc !== undefined) return this.#proc;
    var pid = this.pid;
    if (!pid) return null;
    return (this.#proc = new ProcessRef(pid));
  }

  get name() {
    var { id } = this;
    var k = `WindowRef.name:${id}`;
    var cache = oneTickGet(k);
    if (cache) return cache;
    return oneTickSet(k, "" + ffi.get_window_name(id));
  }

  get pos(): WindowPos {
    var { id } = this;
    var k = `WindowRef.pos:${id}`;
    var cache = oneTickGet(k);
    if (cache) return cache;
    ffi.get_window_location(id, buffer_ptr);
    return oneTickSet(k, new WindowPos(id, buffer[0], buffer[1]));
  }

  set pos(pos: { x?: number; y?: number; screen?: number }) {
    const { id } = this;
    ffi.move_window(id, pos.x ?? this.pos.x, pos.y ?? this.pos.y);
    oneTickDelete(`WindowRef.pos:${id}`);
    oneTickDelete(`WindowRef.x:${id}`);
    oneTickDelete(`WindowRef.y:${id}`);
  }

  get size(): WindowSize {
    var { id } = this;
    var k = `WindowRef.size:${id}`;
    var cache = oneTickGet(k);
    if (cache) return cache;
    ffi.get_window_size(id, buffer_ptr);
    return oneTickSet(k, new WindowSize(id, buffer[0], buffer[1]));
  }

  set size(size: { width?: number; height?: number }) {
    const { id } = this;
    ffi.set_window_size(
      id,
      size.width ?? this.size.width,
      size.height ?? this.size.height,
      0
    );
    oneTickDelete(`WindowRef.pos:${id}`);
    oneTickDelete(`WindowRef.width:${id}`);
    oneTickDelete(`WindowRef.height:${id}`);
  }

  get x() {
    var { id } = this;
    var k = `WindowRef.x:${id}`;
    var cache = oneTickGet(k);
    if (cache) return cache;
    ffi.get_window_location(this.id, buffer_ptr);
    return oneTickSet(k, buffer[0]);
  }

  set x(x: number) {
    var { id } = this;
    ffi.get_window_location(id, buffer_ptr);
    ffi.move_window(id, x, buffer[1]);
    oneTickDelete(`WindowRef.x:${id}`);
    oneTickDelete(`WindowRef.pos:${id}`);
  }

  get y() {
    var { id } = this;
    var k = `WindowRef.y:${id}`;
    var cache = oneTickGet(k);
    if (cache) return cache;
    ffi.get_window_location(id, buffer_ptr);
    return oneTickSet(k, buffer[1]);
  }

  set y(y: number) {
    var { id } = this;
    ffi.get_window_location(id, buffer_ptr);
    ffi.move_window(id, buffer[0], y);
    oneTickDelete(`WindowRef.y:${id}`);
    oneTickDelete(`WindowRef.pos:${id}`);
  }

  get width() {
    var { id } = this;
    var k = `WindowRef.width:${id}`;
    var cache = oneTickGet(k);
    if (cache) return cache;
    ffi.get_window_size(id, buffer_ptr);
    return oneTickSet(k, buffer[0]);
  }

  set width(width: number) {
    var { id } = this;
    ffi.get_window_size(id, buffer_ptr);
    ffi.set_window_size(id, width, buffer[1], 0);
    oneTickDelete(`WindowRef.width:${id}`);
    oneTickDelete(`WindowRef.size:${id}`);
  }

  get height() {
    var { id } = this;
    var k = `WindowRef.height:${id}`;
    var cache = oneTickGet(k);
    if (cache) return cache;
    ffi.get_window_size(id, buffer_ptr);
    return oneTickSet(k, buffer[1]);
  }

  set height(height: number) {
    var { id } = this;
    ffi.get_window_size(id, buffer_ptr);
    ffi.set_window_size(id, buffer[0], height, 0);
    oneTickDelete(`WindowRef.height:${id}`);
    oneTickDelete(`WindowRef.size:${id}`);
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
