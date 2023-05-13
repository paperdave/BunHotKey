import { AnyFunction } from "bun";
import { ptr } from "bun:ffi";

export const returnBuf = new Uint32Array(10);
export const returnPtr = ptr(returnBuf);

const te = new TextEncoder();
const td = new TextDecoder();

export function encodeText(text: string) {
  return te.encode(text);
}

export function decodeText(text: Uint8Array) {
  return td.decode(text);
}

export class Ref {
  timer = setInterval(() => {}, 2 ** 31 - 1);

  unref() {
    clearInterval(this.timer);
  }
}

/**
 * Values in this map last for one process tick. This is used to cache ffi calls.
 */
export class OneTickCache<K, V> extends Map<K, V> {
  private scheduledClear: boolean = false;

  set(key: K, value: V): this {
    super.set(key, value);
    if (!this.scheduledClear) {
      this.scheduledClear = true;
      process.nextTick(() => {
        this.clear();
        this.scheduledClear = false;
      });
    }
    return this;
  }
}

const cache = new OneTickCache<any, any>();

export function oneTickMemo<T extends AnyFunction>(fn: T): T {
  return ((...args: Parameters<T>) => {
    if (cache.has(fn)) {
      return cache.get(fn);
    }
    const result = fn(...args);
    // cache.set(fn, result);
    return result;
  }) as T;
}

export function oneTickFetch<T extends AnyFunction>(fn: T): ReturnType<T> {
  if (cache.has(fn)) {
    return cache.get(fn);
  }
  const result = fn();
  // cache.set(fn, result);
  return result;
}

export function oneTickGet(key: any): any {
  return cache.get(key);
}

export function oneTickSet<T>(key: any, value: T): T {
  // cache.set(key, value);
  return value;
}

export function oneTickDelete(key: any): void {
  cache.delete(key);
}
