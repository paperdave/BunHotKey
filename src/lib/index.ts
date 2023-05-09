// generated with codegen.ts, run `make` to rebuild
import { FFIType, dlopen, suffix } from "bun:ffi";
import path from "path";

type Libraries = Partial<
  Record<Platform, Partial<Record<Architecture, string>>>
>;

let libPath: string;
if (process.env.BHK_PRODUCTION) {
  const libraries: Libraries = {
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
    throw new Error(
      `Unsupported architecture: ${process.arch} on ${process.platform}`
    );
  }
  libPath = path.join(import.meta.dir, library);
} else {
  libPath = path.join(import.meta.dir, `../../zig-out/bhk.${suffix}`);
}

const library = dlopen(libPath, {
  init: {},
  deinit: {},
  jsevdev_thread: {
    args: [FFIType.pointer],
    returns: FFIType.pointer,
  },
  jsevdev_init: {
    args: [FFIType.pointer, FFIType.bool, FFIType.pointer],
    returns: FFIType.pointer,
  },
  jsevdev_dispose: {
    args: [FFIType.pointer],
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
  get_active_window: {
    returns: FFIType.i32,
  },
  move_mouse: {
    args: [FFIType.i32, FFIType.i32, FFIType.i32],
  },
  move_mouse_relative_to_window: {
    args: [FFIType.u64_fast, FFIType.i32, FFIType.i32],
  },
  move_mouse_relative: {
    args: [FFIType.i32, FFIType.i32],
  },
  mouse_down: {
    args: [FFIType.u64_fast, FFIType.i32],
  },
  mouse_up: {
    args: [FFIType.u64_fast, FFIType.i32],
  },
  get_mouse_location: {
    args: [FFIType.pointer],
  },
  get_window_at_mouse: {
    returns: FFIType.u64_fast,
  },
  wait_for_mouse_move_from: {
    args: [FFIType.i32, FFIType.i32],
  },
  wait_for_mouse_move_to: {
    args: [FFIType.i32, FFIType.i32],
  },
  click_window: {
    args: [FFIType.u64_fast, FFIType.i32],
  },
  click_window_multiple: {
    args: [FFIType.u64_fast, FFIType.i32, FFIType.i32, FFIType.u32],
  },
  enter_text_window: {
    args: [FFIType.u64_fast, FFIType.cstring, FFIType.u32],
  },
  send_keysequence_window: {
    args: [FFIType.u64_fast, FFIType.cstring, FFIType.u32],
  },
  send_keysequence_window_up: {
    args: [FFIType.u64_fast, FFIType.cstring, FFIType.u32],
  },
  send_keysequence_window_down: {
    args: [FFIType.u64_fast, FFIType.cstring, FFIType.u32],
  },
  move_window: {
    args: [FFIType.u64_fast, FFIType.i32, FFIType.i32],
  },
  set_window_size: {
    args: [FFIType.u64_fast, FFIType.i32, FFIType.i32, FFIType.i32],
  },
  set_window_property: {
    args: [FFIType.u64_fast, FFIType.cstring, FFIType.cstring],
  },
  set_window_class: {
    args: [FFIType.u64_fast, FFIType.cstring, FFIType.cstring],
  },
  set_window_urgency: {
    args: [FFIType.u64_fast, FFIType.i32],
  },
  focus_window: {
    args: [FFIType.u64_fast],
  },
  raise_window: {
    args: [FFIType.u64_fast],
  },
  activate_window: {
    args: [FFIType.u64_fast],
  },
  get_focused_window: {
    returns: FFIType.u64_fast,
  },
  wait_for_window_focus: {
    args: [FFIType.u64_fast],
  },
  get_window_pid: {
    args: [FFIType.u64_fast],
    returns: FFIType.i32,
  },
  get_window_location: {
    args: [FFIType.u64_fast, FFIType.pointer],
  },
  get_window_size: {
    args: [FFIType.u64_fast, FFIType.pointer],
  },
  wait_select_window_with_click: {
    returns: FFIType.u64_fast,
  },
  get_input_state: {
    returns: FFIType.u32,
  },
  close_window: {
    args: [FFIType.u64_fast],
  },
  kill_window: {
    args: [FFIType.u64_fast],
  },
  quit_window: {
    args: [FFIType.u64_fast],
  },
  get_window_name: {
    args: [FFIType.u64_fast],
    returns: FFIType.cstring,
  },
  kill: {
    args: [FFIType.u32, FFIType.u32],
  },
});
if (!library.symbols) {
  console.error(`BunHotKey library path: ${libPath}`);
  throw library;
}

library.symbols.init();

export const ffi = library.symbols;
