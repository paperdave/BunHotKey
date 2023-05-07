import { dlopen } from "bun:ffi";

const library = dlopen(`/code/paperdave/keybinds/src/lib/bhk.so`, {
  init: {},
});

console.log(library);
