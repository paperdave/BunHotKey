const std = @import("std");

pub const X = @cImport({
    @cInclude("X11/Xlib.h");
    @cInclude("X11/Xutil.h");
    @cInclude("xdo.h");
});

pub const allocator = std.heap.page_allocator;

pub var xdo: ?*X.xdo_t = null;
pub var dpy: ?*X.Display = null;

pub fn init() callconv(.C) void {
    xdo = X.xdo_new(0);
    dpy = xdo.?.xdpy;
}

pub fn deinit() callconv(.C) void {
    if (xdo != null) {
        X.xdo_free(xdo);
        xdo = null;
        dpy = null;
    }
}
