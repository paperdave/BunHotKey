// GENERATED FILE
import { FFIType, dlopen, suffix } from "bun:ffi";
import path from "path";

let libPath: string;
if(process.env.BHK_PRODUCTION) {
  const libraries: any = {
    linux: {
      x64: "bhk.linux-x86_64.so",
    },
  };
  const platform = libraries[process.platform];
  if (!platform) {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }
  const library = platform[process.arch];
  if (!library) {
    throw new Error(`Unsupported architecture: ${process.arch} on ${process.platform}`);
  }
  libPath = path.join(import.meta.dir, library);
} else {
  libPath = path.join(import.meta.dir, `../../zig-out/lib/libbhk.${suffix}`);
}

const { symbols, close } = dlopen(libPath, {
  global__init: {
    args: [],
    returns: FFIType.void /* void */,
  },
  global__deinit: {
    args: [],
    returns: FFIType.void /* void */,
  },
  EventDevice__init: {
    args: [
      FFIType.cstring /* [*:0]const u8 */,
      FFIType.bool /* bool */,
      FFIType.ptr /* *fn(u16, u16, i32) void */,
    ],
    returns: FFIType.ptr /* ?*EventDevice.EventDevice */,
  },
  EventDevice__deinit: {
    args: [
      FFIType.ptr /* ?*EventDevice.EventDevice */,
    ],
    returns: FFIType.void /* void */,
  },
  XKeyGrab__setCallback: {
    args: [
      FFIType.ptr /* *fn(i32, c_ulong, c_ulong, i32, i32, c_ulong, u32, u32) void */,
    ],
    returns: FFIType.void /* void */,
  },
  XKeyGrab__add: {
    args: [
      FFIType.i32 /* i32 */,
      FFIType.u32 /* u32 */,
      FFIType.u64_fast /* c_ulong */,
    ],
    returns: FFIType.ptr /* ?*XKeyGrab.KeyGrab */,
  },
  XKeyGrab__dispose: {
    args: [
      FFIType.ptr /* *XKeyGrab.KeyGrab */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__move_mouse: {
    args: [
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__get_active_window: {
    args: [],
    returns: FFIType.u64_fast /* c_ulong */,
  },
  xdo__move_mouse_relative_to_window: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__move_mouse_relative: {
    args: [
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__mouse_down: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__mouse_up: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__get_mouse_location: {
    args: [
      FFIType.ptr /* [*]i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  kill: {
    args: [FFIType.u32, FFIType.u32],
  },
});

symbols.global__init();

export const ffi = {
  global: {
    init: symbols.global__init,
    deinit: symbols.global__deinit,
  },
  EventDevice: {
    init: symbols.EventDevice__init,
    deinit: symbols.EventDevice__deinit,
  },
  XKeyGrab: {
    setCallback: symbols.XKeyGrab__setCallback,
    add: symbols.XKeyGrab__add,
    dispose: symbols.XKeyGrab__dispose,
  },
  xdo: {
    move_mouse: symbols.xdo__move_mouse,
    get_active_window: symbols.xdo__get_active_window,
    move_mouse_relative_to_window: symbols.xdo__move_mouse_relative_to_window,
    move_mouse_relative: symbols.xdo__move_mouse_relative,
    mouse_down: symbols.xdo__mouse_down,
    mouse_up: symbols.xdo__mouse_up,
    get_mouse_location: symbols.xdo__get_mouse_location,
  },
  close,
  c: {
    kill: symbols.kill,
  }
};
