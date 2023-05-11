// This file just wraps libxdo
const std = @import("std");
const global = @import("./global.zig");
const Window = X.Window;
const X = global.X;
//

pub fn move_mouse(x: i32, y: i32, screen: i32) callconv(.C) void {
    _ = X.xdo_move_mouse(global.xdo, x, y, screen);
}

pub fn get_active_window() callconv(.C) Window {
    var window: Window = 0;
    _ = X.xdo_get_active_window(global.xdo, &window);
    return window;
}

pub fn move_mouse_relative_to_window(w: Window, x: i32, y: i32) callconv(.C) void {
    _ = X.xdo_move_mouse_relative_to_window(global.xdo, w, x, y);
}

pub fn move_mouse_relative(x: i32, y: i32) callconv(.C) void {
    _ = X.xdo_move_mouse_relative(global.xdo, x, y);
}

pub fn mouse_down(w: Window, button: i32) callconv(.C) void {
    _ = X.xdo_mouse_down(global.xdo, w, button);
}

pub fn mouse_up(w: Window, button: i32) callconv(.C) void {
    _ = X.xdo_mouse_up(global.xdo, w, button);
}

pub fn get_mouse_location(buffer: [*]i32) callconv(.C) void {
    std.log.info("get_mouse_location", .{});
    _ = X.xdo_get_mouse_location(global.xdo, &buffer[0], &buffer[1], &buffer[2]);
}
