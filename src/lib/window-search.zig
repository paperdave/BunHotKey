// This file just wraps libxdo for the most part
const std = @import("std");
const global = @import("./global.zig");
const Window = X.Window;
const X = global.X;
const xdo = @import("./xdo.zig");
//

pub fn main() void {
    global.init();
    var w = X.XDefaultRootWindow(global.dpy);
    printTree(w, 0);
}

pub fn printTree(w: Window, indent: u32) void {
    for (0..indent) |i| {
        _ = i;
        std.debug.print(" ", .{});
    }
    var name: [*c]u8 = undefined;
    var name_len: i32 = 0;
    var name_type: i32 = undefined;
    _ = X.xdo_get_window_name(global.xdo, w, &name, &name_len, &name_type);
    if (name_len != 0) {
        std.debug.print("- {d}: {s}\n", .{ w, name[0..@intCast(usize, name_len)] });
    } else {
        var pid = xdo.getWindowPID(w);
        std.debug.print("- {d} pid={d}\n", .{ w, pid });
    }
    var root: Window = undefined;
    var parent: Window = undefined;
    var children: [*c]Window = undefined;
    var nchildren: u32 = undefined;
    _ = X.XQueryTree(global.dpy, w, &root, &parent, &children, &nchildren);
    for (0..indent) |i| {
        _ = i;
        std.debug.print(" ", .{});
    }
    if (nchildren != 0) {
        for (children[0..nchildren]) |child| {
            printTree(child, indent + 2);
        }
    }
}
