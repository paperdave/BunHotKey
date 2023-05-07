// generated with codegen.ts, run `make` to rebuild
import { FFIType, dlopen, suffix } from "bun:ffi";
import path from "path";

const library = dlopen(path.join(import.meta.dir, `bhk.${suffix}`), {
  init: {},
});
if (!library.symbols) {
  throw library;
}

library.symbols.init();

export const ffi = library.symbols;
