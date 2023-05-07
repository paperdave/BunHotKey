// generated with codegen.ts, run `make` to rebuild
import { FFIType, dlopen, suffix } from "bun:ffi";
import path from "path";

const library = dlopen(path.join(import.meta.dir, `bhk.${suffix}`), {
  init: {

  },
  deinit: {

  },
  jskeygrab_thread: {
    args: [FFIType.pointer],
    returns: FFIType.pointer,
  },
  jskeygrab_set_cb: {
    args: [FFIType.pointer],
  },
  jskeygrab_add: {
    args: [FFIType.i32, FFIType.u32, FFIType.u64_fast],
    returns: FFIType.pointer,
  },
  jskeygrab_dispose: {
    args: [FFIType.pointer],
  },
  kill: {
    args: [FFIType.u32, FFIType.u32],
  },
});
if (!library.symbols) {
  throw library;
}

library.symbols.init();

export const ffi = library.symbols;
