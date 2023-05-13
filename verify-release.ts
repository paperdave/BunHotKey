import assert from "assert";
const lib = await import("./dist/index.js");

assert(lib.ui);
assert(lib.i3);
assert(lib.Device);
assert(typeof lib.ui.mouse.pos.x === "number");

console.log("Release is valid");
