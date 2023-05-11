// https://www.kernel.org/doc/html/v4.17/input/event-codes.html
const std = @import("std");
const global = @import("./global.zig");
const Window = global.Window;
const X = global.X;
const dpy = global.dpy;
const allocator = global.allocator;
//

const EVIOCGRAB = 0x40044590;

pub const Timeval = extern struct {
    tv_sec: c_long,
    tv_usec: c_long,
};
pub const InputEvent = extern struct {
    time: Timeval,
    type: EventType,
    code: u16,
    value: i32,
};

pub const EventType = enum(u16) {
    SYN = 0x00, // Syncronization
    KEY = 0x01, // Keypress/release/etc
    REL = 0x02, // Relative movement, mice, etc, etc
    ABS = 0x03, // Absolute movement, touchpads, etc, etc
    MSC = 0x04, // Misc input data
    SW = 0x05, //  Switches, such as laptop lid
    LED = 0x11, // LEDs
    SND = 0x12, // Simple sound devices
    REP = 0x14, // Autorepeat values
    FF = 0x15, //  Force feedback
    PWR = 0x16, // Power management "Its usage is not well defined."
    FF_STATUS = 0x17,

    pub fn toInt(self: EventType) u16 {
        return @enumToInt(self);
    }
};

const EventDeviceCallback = fn (type: u16, code: u16, value: i32) void;

fn eventDeviceThread(device: EventDevice) void {
    std.log.info("starting thread with device {s}, and fd {d}\n", .{ device.path, device.file.handle });

    var ev: InputEvent = undefined;
    while (device.running) {
        var n = std.os.system.read(
            device.file.handle,
            @ptrCast([*]u8, &ev),
            @as(isize, @sizeOf(InputEvent)),
        );
        switch (std.os.errno(n)) {
            .SUCCESS => {
                device.callback(ev.type.toInt(), ev.code, ev.value);
            },
            .INTR => {
                continue;
            },
            else => |e| {
                std.log.err("Failed to read event from device {s}: {s}", .{
                    device.path,
                    @tagName(e),
                });
                break;
            },
        }
    }

    std.log.info("exiting thread with device {s}, and fd {d}", .{
        device.path,
        device.file.handle,
    });
}

pub const EventDevice = struct {
    path: [*:0]const u8,
    file: std.fs.File,
    grabbed: bool,
    running: bool,
    thread: std.Thread,
    callback: *EventDeviceCallback,

    pub fn init(path: [*:0]const u8, grab: bool, callback: *EventDeviceCallback) ?*EventDevice {
        const file = std.fs.openFileAbsoluteZ(path, .{}) catch {
            std.log.err("Failed to open event device: {s}\n", .{path});
            return null;
        };

        if (grab) {
            if (std.c.ioctl(file.handle, EVIOCGRAB, @as(c_int, 1)) == @as(c_int, -1)) {
                std.log.err("Failed to grab event device: {s}\n", .{path});
                file.close();
                return null;
            }
        }

        const device = allocator.create(EventDevice) catch {
            std.log.err("Failed to allocate event device\n", .{});
            file.close();
            return null;
        };

        device.path = path;
        device.file = file;
        device.grabbed = grab;
        device.running = true;
        device.callback = callback;
        device.thread = std.Thread.spawn(.{}, eventDeviceThread, .{device.*}) catch {
            std.log.err("Failed to start event device thread\n", .{});
            allocator.destroy(device);
            file.close();
            return null;
        };

        return device;
    }

    pub fn deinit(device: *EventDevice) void {
        device.running = false;
        if (device.grabbed) {
            _ = std.c.ioctl(device.file.handle, EVIOCGRAB, @as(c_int, 0));
        }
        device.file.close();
        device.thread.join();
        allocator.destroy(device);
    }
};

//

pub fn init(path: [*:0]const u8, grab: bool, callback: *EventDeviceCallback) callconv(.C) ?*EventDevice {
    return EventDevice.init(path, grab, callback);
}

pub fn deinit(device: ?*EventDevice) callconv(.C) void {
    if (device) |d|
        d.deinit();
}
