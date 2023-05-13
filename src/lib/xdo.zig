// This file just wraps libxdo for the most part
const std = @import("std");
const global = @import("./global.zig");
const Window = X.Window;
const X = global.X;
//

pub fn moveMouse(x: i32, y: i32, screen: i32) callconv(.C) void {
    _ = X.xdo_move_mouse(global.xdo, x, y, screen);
}

pub fn getActiveWindow() callconv(.C) Window {
    var window: Window = 0;
    _ = X.xdo_get_active_window(global.xdo, &window);
    return window;
}

pub fn moveMouseRelativeToWindow(w: Window, x: i32, y: i32) callconv(.C) void {
    _ = X.xdo_move_mouse_relative_to_window(global.xdo, w, x, y);
}

pub fn moveMouseRelative(x: i32, y: i32) callconv(.C) void {
    _ = X.xdo_move_mouse_relative(global.xdo, x, y);
}

pub fn mouseDown(w: Window, button: i32) callconv(.C) void {
    _ = X.xdo_mouse_down(global.xdo, w, button);
}

pub fn mouseUp(w: Window, button: i32) callconv(.C) void {
    _ = X.xdo_mouse_up(global.xdo, w, button);
}

pub fn getMouseLocation(buffer: [*]i32) callconv(.C) void {
    _ = X.xdo_get_mouse_location(global.xdo, &buffer[0], &buffer[1], &buffer[2]);
}

pub fn getWindowAtMouse() callconv(.C) Window {
    var window: Window = undefined;
    if (X.xdo_get_window_at_mouse(global.xdo, &window) != 0) {
        return window;
    }
    return 0;
}

pub fn getWindowName(w: Window) callconv(.C) [*]const u8 {
    var name: [*c]u8 = undefined;
    var name_len: i32 = undefined;
    var name_type: i32 = undefined;
    _ = X.xdo_get_window_name(global.xdo, w, &name, &name_len, &name_type);
    return name;
}

pub fn waitForMouseMoveFrom(x: i32, y: i32) callconv(.C) void {
    _ = X.xdo_wait_for_mouse_move_from(global.xdo, x, y);
}

pub fn waitForMouseMoveTo(x: i32, y: i32) callconv(.C) void {
    _ = X.xdo_wait_for_mouse_move_to(global.xdo, x, y);
}

pub fn clickWindow(w: Window, button: i32) callconv(.C) void {
    _ = X.xdo_click_window(global.xdo, w, button);
}

pub fn clickWindowMultiple(w: Window, button: i32, repeat: i32, delay: u32) callconv(.C) void {
    _ = X.xdo_click_window_multiple(global.xdo, w, button, repeat, delay);
}

pub fn enterTextWindow(w: Window, text: [*]const u8, delay: u32) callconv(.C) void {
    _ = X.xdo_enter_text_window(global.xdo, w, text, delay);
}

pub fn sendKeysequenceWindow(w: Window, keysequence: [*]const u8, delay: u32) callconv(.C) void {
    _ = X.xdo_send_keysequence_window(global.xdo, w, keysequence, delay);
}

pub fn sendKeysequenceWindowDown(w: Window, keysequence: [*]const u8, delay: u32) callconv(.C) void {
    _ = X.xdo_send_keysequence_window_down(global.xdo, w, keysequence, delay);
}

pub fn sendKeysequenceWindowUp(w: Window, keysequence: [*]const u8, delay: u32) callconv(.C) void {
    _ = X.xdo_send_keysequence_window_up(global.xdo, w, keysequence, delay);
}

pub fn moveWindow(w: Window, x: i32, y: i32) callconv(.C) void {
    _ = X.xdo_move_window(global.xdo, w, x, y);
}

pub fn setWindowSize(w: Window, width: i32, height: i32) callconv(.C) void {
    _ = X.xdo_set_window_size(global.xdo, w, width, height, 0);
}

pub fn setWindowProperty(w: Window, property: [*]const u8, value: [*]const u8) callconv(.C) void {
    _ = X.xdo_set_window_property(global.xdo, w, property, value);
}

pub fn setWindowClass(w: Window, name: [*]const u8, class: [*]const u8) callconv(.C) void {
    _ = X.xdo_set_window_class(global.xdo, w, name, class);
}

pub fn setWindowUrgency(w: Window, urgency: i32) callconv(.C) void {
    _ = X.xdo_set_window_urgency(global.xdo, w, urgency);
}

pub fn activateWindow(w: Window) callconv(.C) void {
    _ = X.xdo_activate_window(global.xdo, w);
}

pub fn focusWindow(w: Window) callconv(.C) void {
    _ = X.xdo_focus_window(global.xdo, w);
}

pub fn raiseWindow(w: Window) callconv(.C) void {
    _ = X.xdo_raise_window(global.xdo, w);
}

pub fn getFocusedWindow() callconv(.C) Window {
    var window: Window = undefined;
    if (X.xdo_get_focused_window(global.xdo, &window) != 0) {
        return window;
    }
    return 0;
}

pub fn getWindowPID(w: Window) callconv(.C) i32 {
    return X.xdo_get_pid_window(global.xdo, w);
}

pub fn getWindowLocation(w: Window, buffer: [*]i32) callconv(.C) void {
    _ = X.xdo_get_window_location(global.xdo, w, &buffer[0], &buffer[1], 0);
}

pub fn getWindowSize(w: Window, buffer: [*]u32) callconv(.C) void {
    _ = X.xdo_get_window_size(global.xdo, w, &buffer[0], &buffer[1]);
}

pub fn waitSelectWindowWithClick() callconv(.C) Window {
    var w: Window = undefined;
    _ = X.xdo_select_window_with_click(global.xdo, &w);
    return w;
}

pub fn getInputState() callconv(.C) u32 {
    return X.xdo_get_input_state(global.xdo);
}

// pub fn getSymbolMap() callconv(.C) [*][*]const u8 {
//     return X.xdo_get_symbol_map();
// }

pub fn killWindow(w: Window) callconv(.C) void {
    _ = X.xdo_kill_window(global.xdo, w);
}

pub fn closeWindow(w: Window) callconv(.C) void {
    _ = X.xdo_quit_window(global.xdo, w);
}

// Searching for one window is done without passing a buffer
pub fn searchWindowSingle(
    mask: u32,
    require: u32,
    class: [*c]const u8,
    classname: [*c]const u8,
    name: [*c]const u8,
    role: [*c]const u8,
    max_depth: i32,
    pid: i32,
    only_visible: bool,
) callconv(.C) Window {
    _ = only_visible;
    var windowList: [*c]Window = undefined;
    var n: u32 = undefined;
    var search = X.xdo_search{
        .title = null,
        .winclass = class,
        .winclassname = classname,
        .winname = name,
        .winrole = role,
        .max_depth = max_depth,
        .pid = pid,
        .only_visible = 1,
        .require = require,
        .searchmask = mask,
        .screen = 0,
        .desktop = 0,
        .limit = 1,
    };
    _ = X.xdo_search_windows(
        global.xdo,
        &search,
        &windowList,
        &n,
    );
    defer std.c.free(windowList);

    if (n > 0) {
        return windowList[0];
    } else {
        return 0;
    }
}

// When multiple windows are requests, we pass a buffer. Unfortunatly, we can't just have XDO
// write to that buffer, as they allocate their own. So this just simplifies it to copy the memory.
pub fn searchWindowMultiple(
    mask: u32,
    require: u32,
    class: [*]const u8,
    classname: [*]const u8,
    name: [*]const u8,
    role: [*]const u8,
    max_depth: i32,
    pid: i32,
    only_visible: bool,
    buffer: [*]Window,
    limit: u32,
) callconv(.C) u32 {
    _ = only_visible;
    var windowList: [*c]Window = undefined;
    var n: u32 = undefined;
    _ = X.xdo_search_windows(
        global.xdo,
        &X.xdo_search{
            .title = null,
            .winclass = class,
            .winclassname = classname,
            .winname = name,
            .winrole = role,
            .max_depth = max_depth,
            .pid = pid,
            .only_visible = 1,
            .require = require,
            .searchmask = mask,
            .screen = 0,
            .desktop = 0,
            .limit = limit,
        },
        &windowList,
        &n,
    );
    defer std.c.free(windowList);
    if (n > 0) {
        std.mem.copy(Window, buffer[0..n], windowList[0..n]);
        return n;
    } else {
        return 0;
    }
}
