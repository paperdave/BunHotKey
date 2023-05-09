const std = @import("std");
const testing = std.testing;

const X = @cImport({
    @cInclude("X11/Xlib.h");
    @cInclude("X11/Xutil.h");
    @cInclude("xdo.h");
});
const Window = X.Window;

var xdo: ?*X.xdo_t = null;
var dpy: ?*X.Display = null;

export fn init() void {
    xdo = X.xdo_new(0);
    dpy = xdo.?.xdpy;
}

export fn deinit() void {
    if (xdo != null) {
        X.xdo_free(xdo);
        xdo = null;
        dpy = null;
    }
}

//

const allocator = std.heap.page_allocator;

const KeyGrab = struct {
    keycode: i32,
    modifiers: u32,
    window: Window,
    hasMod2: bool,
};
const KeyGrabCallback = fn (type: i32, window: Window, subwindow: Window, x: i32, y: i32, time: X.Time, keycode: u32, modifiers: u32) void;

var jskeygrab_count: u32 = 0;
var jskeygrab_cb: ?*KeyGrabCallback = null;
var jskeygrab_t: ?std.Thread = null;

fn jskeygrab_thread() void {
    var event: X.XEvent = undefined;
    while (jskeygrab_count > 0) {
        _ = X.XNextEvent(dpy, &event);
        if (event.type == X.KeyPress) {
            jskeygrab_cb.?(event.xkey.type, if (event.xkey.window == event.xkey.root) 0 else event.xkey.window, event.xkey.subwindow, event.xkey.x, event.xkey.y, event.xkey.time, event.xkey.keycode, event.xkey.state);
        }
    }
}

export fn jskeygrab_set_cb(cb: *KeyGrabCallback) void {
    jskeygrab_cb = cb;
}

export fn jskeygrab_add(keycode: i32, modifiers: u32, window: Window) ?*KeyGrab {
    var w = if (window == 0) X.DefaultRootWindow(dpy) else window;

    var result = X.XGrabKey(dpy, keycode, modifiers, w, 0, X.GrabModeAsync, X.GrabModeAsync);
    if (result != 0) {
        std.log.err("XGrabKey failed: {d}", .{result});
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
        result = X.XGrabKey(dpy, keycode, modifiers | X.Mod2Mask, w, 0, X.GrabModeAsync, X.GrabModeAsync);
        key.hasMod2 = result == 1;
    } else {
        key.hasMod2 = false;
    }

    if (jskeygrab_count == 0) {
        jskeygrab_t = std.Thread.spawn(.{}, jskeygrab_thread, .{}) catch {
            std.log.err("failed to spawn thread", .{});
            allocator.destroy(key);
            return null;
        };
    }
    jskeygrab_count += 1;

    return key;
}

export fn jskeygrab_dispose(key: *KeyGrab) void {
    _ = X.XUngrabKey(dpy, key.keycode, key.modifiers, key.window);
    if (key.hasMod2) _ = X.XUngrabKey(dpy, key.keycode, key.modifiers | X.Mod2Mask, key.window);
    allocator.destroy(key);
    jskeygrab_count -= 1;
    if (jskeygrab_count == 0) {
        jskeygrab_t.?.join();
        jskeygrab_t = null;
    }
}
//

export fn move_mouse(x: i32, y: i32, screen: i32) void {
    _ = X.xdo_move_mouse(xdo, x, y, screen);
}

export fn get_active_window() Window {
    var window: Window = 0;
    _ = X.xdo_get_active_window(xdo, &window);
    return window;
}

export fn move_mouse_relative_to_window(w: Window, x: i32, y: i32) void {
    _ = X.xdo_move_mouse_relative_to_window(xdo, w, x, y);
}

export fn move_mouse_relative(x: i32, y: i32) void {
    _ = X.xdo_move_mouse_relative(xdo, x, y);
}

export fn mouse_down(w: Window, button: i32) void {
    _ = X.xdo_mouse_down(xdo, w, button);
}

export fn mouse_up(w: Window, button: i32) void {
    _ = X.xdo_mouse_up(xdo, w, button);
}

export fn get_mouse_location(buffer: [*]i32) void {
    std.log.info("get_mouse_location", .{});
    var thing = X.xdo_get_mouse_location(xdo, &buffer[0], &buffer[1], &buffer[2]);
    _ = thing;
    std.log.info("{d}, {d}", .{ buffer[0], buffer[1] });
}
