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
  xdo__moveMouse: {
    args: [
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__getActiveWindow: {
    args: [],
    returns: FFIType.u64_fast /* c_ulong */,
  },
  xdo__moveMouseRelativeToWindow: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__moveMouseRelative: {
    args: [
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__mouseDown: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__mouseUp: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__getMouseLocation: {
    args: [
      FFIType.ptr /* [*]i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__getWindowAtMouse: {
    args: [],
    returns: FFIType.u64_fast /* c_ulong */,
  },
  xdo__getWindowName: {
    args: [
      FFIType.u64_fast /* c_ulong */,
    ],
    returns: FFIType.cstring /* [*]const u8 */,
  },
  xdo__waitForMouseMoveFrom: {
    args: [
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__waitForMouseMoveTo: {
    args: [
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__clickWindow: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__clickWindowMultiple: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
      FFIType.u32 /* u32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__enterTextWindow: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.cstring /* [*]const u8 */,
      FFIType.u32 /* u32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__sendKeysequenceWindow: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.cstring /* [*]const u8 */,
      FFIType.u32 /* u32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__sendKeysequenceWindowDown: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.cstring /* [*]const u8 */,
      FFIType.u32 /* u32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__sendKeysequenceWindowUp: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.cstring /* [*]const u8 */,
      FFIType.u32 /* u32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__moveWindow: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__setWindowSize: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__setWindowProperty: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.cstring /* [*]const u8 */,
      FFIType.cstring /* [*]const u8 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__setWindowClass: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.cstring /* [*]const u8 */,
      FFIType.cstring /* [*]const u8 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__setWindowUrgency: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.i32 /* i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__activateWindow: {
    args: [
      FFIType.u64_fast /* c_ulong */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__focusWindow: {
    args: [
      FFIType.u64_fast /* c_ulong */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__raiseWindow: {
    args: [
      FFIType.u64_fast /* c_ulong */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__getFocusedWindow: {
    args: [],
    returns: FFIType.u64_fast /* c_ulong */,
  },
  xdo__getWindowPID: {
    args: [
      FFIType.u64_fast /* c_ulong */,
    ],
    returns: FFIType.i32 /* i32 */,
  },
  xdo__getWindowLocation: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.ptr /* [*]i32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__getWindowSize: {
    args: [
      FFIType.u64_fast /* c_ulong */,
      FFIType.ptr /* [*]u32 */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__waitSelectWindowWithClick: {
    args: [],
    returns: FFIType.u64_fast /* c_ulong */,
  },
  xdo__getInputState: {
    args: [],
    returns: FFIType.u32 /* u32 */,
  },
  xdo__killWindow: {
    args: [
      FFIType.u64_fast /* c_ulong */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__closeWindow: {
    args: [
      FFIType.u64_fast /* c_ulong */,
    ],
    returns: FFIType.void /* void */,
  },
  xdo__searchWindowSingle: {
    args: [
      FFIType.u32 /* u32 */,
      FFIType.u32 /* u32 */,
      FFIType.cstring /* [*c]const u8 */,
      FFIType.cstring /* [*c]const u8 */,
      FFIType.cstring /* [*c]const u8 */,
      FFIType.cstring /* [*c]const u8 */,
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
      FFIType.bool /* bool */,
    ],
    returns: FFIType.u64_fast /* c_ulong */,
  },
  xdo__searchWindowMultiple: {
    args: [
      FFIType.u32 /* u32 */,
      FFIType.u32 /* u32 */,
      FFIType.cstring /* [*]const u8 */,
      FFIType.cstring /* [*]const u8 */,
      FFIType.cstring /* [*]const u8 */,
      FFIType.cstring /* [*]const u8 */,
      FFIType.i32 /* i32 */,
      FFIType.i32 /* i32 */,
      FFIType.bool /* bool */,
      FFIType.ptr /* [*]c_ulong */,
      FFIType.u32 /* u32 */,
    ],
    returns: FFIType.u32 /* u32 */,
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
    moveMouse: symbols.xdo__moveMouse,
    getActiveWindow: symbols.xdo__getActiveWindow,
    moveMouseRelativeToWindow: symbols.xdo__moveMouseRelativeToWindow,
    moveMouseRelative: symbols.xdo__moveMouseRelative,
    mouseDown: symbols.xdo__mouseDown,
    mouseUp: symbols.xdo__mouseUp,
    getMouseLocation: symbols.xdo__getMouseLocation,
    getWindowAtMouse: symbols.xdo__getWindowAtMouse,
    getWindowName: symbols.xdo__getWindowName,
    waitForMouseMoveFrom: symbols.xdo__waitForMouseMoveFrom,
    waitForMouseMoveTo: symbols.xdo__waitForMouseMoveTo,
    clickWindow: symbols.xdo__clickWindow,
    clickWindowMultiple: symbols.xdo__clickWindowMultiple,
    enterTextWindow: symbols.xdo__enterTextWindow,
    sendKeysequenceWindow: symbols.xdo__sendKeysequenceWindow,
    sendKeysequenceWindowDown: symbols.xdo__sendKeysequenceWindowDown,
    sendKeysequenceWindowUp: symbols.xdo__sendKeysequenceWindowUp,
    moveWindow: symbols.xdo__moveWindow,
    setWindowSize: symbols.xdo__setWindowSize,
    setWindowProperty: symbols.xdo__setWindowProperty,
    setWindowClass: symbols.xdo__setWindowClass,
    setWindowUrgency: symbols.xdo__setWindowUrgency,
    activateWindow: symbols.xdo__activateWindow,
    focusWindow: symbols.xdo__focusWindow,
    raiseWindow: symbols.xdo__raiseWindow,
    getFocusedWindow: symbols.xdo__getFocusedWindow,
    getWindowPID: symbols.xdo__getWindowPID,
    getWindowLocation: symbols.xdo__getWindowLocation,
    getWindowSize: symbols.xdo__getWindowSize,
    waitSelectWindowWithClick: symbols.xdo__waitSelectWindowWithClick,
    getInputState: symbols.xdo__getInputState,
    killWindow: symbols.xdo__killWindow,
    closeWindow: symbols.xdo__closeWindow,
    searchWindowSingle: symbols.xdo__searchWindowSingle,
    searchWindowMultiple: symbols.xdo__searchWindowMultiple,
  },
  close,
  c: {
    kill: symbols.kill,
  }
};
