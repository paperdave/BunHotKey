import { ptr } from "bun:ffi";

export const buffer = new Uint32Array(3);
export const buffer_ptr = ptr(buffer);
const te = new TextEncoder();
const td = new TextDecoder();
export function encodeText(text: string) {
  return te.encode(text);
}
export function decodeText(text: Uint8Array) {
  return td.decode(text);
}
