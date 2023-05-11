const std = @import("std");
const global = @import("./global.zig");
const Window = X.Window;
const X = global.X;
const allocator = global.allocator;

const KeyGrab = struct {
    keycode: i32,
    modifiers: u32,
    window: Window,
    hasMod2: bool,
};
const KeyGrabCallback = fn (type: i32, window: Window, subwindow: Window, x: i32, y: i32, time: X.Time, keycode: u32, modifiers: u32) void;

var count: u32 = 0;
var callback: ?*KeyGrabCallback = null;
var thread: ?std.Thread = null;

fn keygrabThread() void {
    var event: X.XEvent = undefined;
    while (count > 0) {
        _ = X.XNextEvent(global.dpy, &event);
        if (event.type == X.KeyPress) {
            callback.?(event.xkey.type, if (event.xkey.window == event.xkey.root) 0 else event.xkey.window, event.xkey.subwindow, event.xkey.x, event.xkey.y, event.xkey.time, event.xkey.keycode, event.xkey.state);
        }
    }
}

pub fn setCallback(cb: *KeyGrabCallback) callconv(.C) void {
    callback = cb;
}

pub fn add(keycode: i32, modifiers: u32, window: Window) callconv(.C) ?*KeyGrab {
    var w = if (window == 0) X.DefaultRootWindow(global.dpy) else window;

    var result = X.XGrabKey(global.dpy, keycode, modifiers, w, 0, X.GrabModeAsync, X.GrabModeAsync);
    if (result != 1) {
        std.log.err("XGrabKey returned {d}", .{result});
        return null;
    }

    const key = allocator.create(KeyGrab) catch {
        std.log.err("failed to allocate KeyGrab", .{});
        return null;
    };
    key.keycode = keycode;
    key.modifiers = modifiers;
    key.window = w;

    if ((modifiers & X.Mod2Mask) == 0) {
        result = X.XGrabKey(global.dpy, keycode, modifiers | X.Mod2Mask, w, 0, X.GrabModeAsync, X.GrabModeAsync);
        key.hasMod2 = result == 1;
    } else {
        key.hasMod2 = false;
    }

    if (count == 0) {
        thread = std.Thread.spawn(.{}, keygrabThread, .{}) catch {
            std.log.err("failed to spawn thread", .{});
            allocator.destroy(key);
            return null;
        };
    }
    count += 1;

    return key;
}

pub fn dispose(key: *KeyGrab) callconv(.C) void {
    _ = X.XUngrabKey(global.dpy, key.keycode, key.modifiers, key.window);
    if (key.hasMod2) _ = X.XUngrabKey(global.dpy, key.keycode, key.modifiers | X.Mod2Mask, key.window);
    allocator.destroy(key);
    count -= 1;
    if (count == 0) {
        thread.?.join();
        thread = null;
    }
}
