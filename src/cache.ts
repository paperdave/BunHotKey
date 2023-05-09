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

const cache = new OneTickCache<any, any>();

export function oneTickMemo<T extends AnyFunction>(fn: T): T {
  return ((...args: Parameters<T>) => {
    if (cache.has(fn)) {
      return cache.get(fn);
    }
    const result = fn(...args);
    cache.set(fn, result);
    return result;
  }) as T;
}

export function oneTickFetch<T extends AnyFunction>(fn: T): ReturnType<T> {
  if (cache.has(fn)) {
    return cache.get(fn);
  }
  const result = fn();
  cache.set(fn, result);
  return result;
}

export function oneTickGet(key: any): any {
  return cache.get(key);
}

export function oneTickSet<T>(key: any, value: T): T {
  cache.set(key, value);
  return value;
}

export function oneTickDelete(key: any): void {
  cache.delete(key);
}
