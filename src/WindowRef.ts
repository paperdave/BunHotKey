import { ProcessRef } from "./ProcessRef";
import { oneTickDelete, oneTickGet, oneTickSet } from "./cache";
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
    ffi.xdo.moveWindow(this.#id, this.#x, this.#y);
  }
  set y(y: number) {
    this.#y = y;
    ffi.xdo.moveWindow(this.#id, this.#x, this.#y);
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
    ffi.xdo.moveWindow(this.#id, this.#w, this.#h);
  }
  set height(y: number) {
    this.#h = y;
    ffi.xdo.moveWindow(this.#id, this.#w, this.#h);
  }
}

export class WindowRef {
  constructor(readonly id: WindowID) {}

  #pid: number | null = null;
  get pid() {
    return this.#pid ?? (this.#pid = ffi.xdo.getWindowPID(this.id));
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
    return oneTickSet(k, "" + ffi.xdo.getWindowName(id));
  }

  get pos(): WindowPos {
    var { id } = this;
    var k = `WindowRef.pos:${id}`;
    var cache = oneTickGet(k);
    if (cache) return cache;
    ffi.xdo.getWindowLocation(id, buffer_ptr);
    return oneTickSet(k, new WindowPos(id, buffer[0], buffer[1]));
  }

  set pos(pos: { x?: number; y?: number; screen?: number }) {
    const { id } = this;
    ffi.xdo.moveWindow(id, pos.x ?? this.pos.x, pos.y ?? this.pos.y);
    oneTickDelete(`WindowRef.pos:${id}`);
    oneTickDelete(`WindowRef.x:${id}`);
    oneTickDelete(`WindowRef.y:${id}`);
  }

  get size(): WindowSize {
    var { id } = this;
    var k = `WindowRef.size:${id}`;
    var cache = oneTickGet(k);
    if (cache) return cache;
    ffi.xdo.getWindowSize(id, buffer_ptr);
    return oneTickSet(k, new WindowSize(id, buffer[0], buffer[1]));
  }

  set size(size: { width?: number; height?: number }) {
    const { id } = this;
    ffi.xdo.setWindowSize(
      id,
      size.width ?? this.size.width,
      size.height ?? this.size.height
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
    ffi.xdo.getWindowLocation(this.id, buffer_ptr);
    return oneTickSet(k, buffer[0]);
  }

  set x(x: number) {
    var { id } = this;
    ffi.xdo.getWindowLocation(id, buffer_ptr);
    ffi.xdo.moveWindow(id, x, buffer[1]);
    oneTickDelete(`WindowRef.x:${id}`);
    oneTickDelete(`WindowRef.pos:${id}`);
  }

  get y() {
    var { id } = this;
    var k = `WindowRef.y:${id}`;
    var cache = oneTickGet(k);
    if (cache) return cache;
    ffi.xdo.getWindowLocation(id, buffer_ptr);
    return oneTickSet(k, buffer[1]);
  }

  set y(y: number) {
    var { id } = this;
    ffi.xdo.getWindowLocation(id, buffer_ptr);
    ffi.xdo.moveWindow(id, buffer[0], y);
    oneTickDelete(`WindowRef.y:${id}`);
    oneTickDelete(`WindowRef.pos:${id}`);
  }

  get width() {
    var { id } = this;
    var k = `WindowRef.width:${id}`;
    var cache = oneTickGet(k);
    if (cache) return cache;
    ffi.xdo.getWindowSize(id, buffer_ptr);
    return oneTickSet(k, buffer[0]);
  }

  set width(width: number) {
    var { id } = this;
    ffi.xdo.getWindowSize(id, buffer_ptr);
    ffi.xdo.setWindowSize(id, width, buffer[1]);
    oneTickDelete(`WindowRef.width:${id}`);
    oneTickDelete(`WindowRef.size:${id}`);
  }

  get height() {
    var { id } = this;
    var k = `WindowRef.height:${id}`;
    var cache = oneTickGet(k);
    if (cache) return cache;
    ffi.xdo.getWindowSize(id, buffer_ptr);
    return oneTickSet(k, buffer[1]);
  }

  set height(height: number) {
    var { id } = this;
    ffi.xdo.getWindowSize(id, buffer_ptr);
    ffi.xdo.setWindowSize(id, buffer[0], height);
    oneTickDelete(`WindowRef.height:${id}`);
    oneTickDelete(`WindowRef.size:${id}`);
  }

  kill() {
    ffi.xdo.killWindow(this.id);
  }

  close() {
    ffi.xdo.closeWindow(this.id);
  }

  click(button: number) {
    ffi.xdo.clickWindow(this.id, button);
  }

  clickMultiple(button: number, times: number, delay = 1) {
    ffi.xdo.clickWindowMultiple(this.id, button, times, delay * 1000);
  }

  type(text: string, delay = 0) {
    ffi.xdo.enterTextWindow(this.id, encodeText(text) as any, delay * 1000);
  }
}
