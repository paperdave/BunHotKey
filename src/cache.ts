import { AnyFunction } from "bun";

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

const memos = new OneTickCache<Function, any>();

export function oneTickMemo<T extends AnyFunction>(fn: T): T {
  return ((...args: Parameters<T>) => {
    if (memos.has(fn)) {
      return memos.get(fn);
    }
    const result = fn(...args);
    memos.set(fn, result);
    return result;
  }) as T;
}
