// BHK's Zig library is built with a custom binding generator, which is this file.
//
// In other files, declare public functions with callconv(.C) and they will be exported
// and available within JS. Like magic.
//
// Just add any new files to this `modules` array:
const global = @import("./global.zig");
const modules = .{
    .{ .name = "global", .val = struct {
        pub const init = global.init;
        pub const deinit = global.deinit;
    } },
    .{ .name = "EventDevice", .val = @import("./EventDevice.zig") },
    .{ .name = "XKeyGrab", .val = @import("./XKeyGrab.zig") },
    .{ .name = "xdo", .val = @import("./xdo.zig") },
};

// Auto Exporter
comptime {
    for (modules) |mod| {
        const mod_type = @typeInfo(mod.val).Struct;
        for (mod_type.decls) |dec| {
            if (dec.is_pub) {
                const dec_type = @typeInfo(@TypeOf(@field(mod.val, dec.name)));
                switch (dec_type) {
                    .Fn => |fun| {
                        if (fun.calling_convention == .C) {
                            const dec_value = @field(mod.val, dec.name);
                            @export(dec_value, .{
                                .name = mod.name ++ "__" ++ dec.name,
                                .linkage = .Strong,
                            });
                        }
                    },
                    else => {},
                }
            }
        }
    }
}

// Binding generator
const std = @import("std");
const template_1 =
    \\// GENERATED FILE
    \\import { FFIType, dlopen, suffix } from "bun:ffi";
    \\import path from "path";
    \\
    \\let libPath: string;
    \\if(process.env.BHK_PRODUCTION) {
    \\  const libraries: any = {
    \\    linux: {
    \\      x64: "bhk.linux-x86_64.so",
    \\    },
    \\  };
    \\  const platform = libraries[process.platform];
    \\  if (!platform) {
    \\    throw new Error(`Unsupported platform: ${process.platform}`);
    \\  }
    \\  const library = platform[process.arch];
    \\  if (!library) {
    \\    throw new Error(`Unsupported architecture: ${process.arch} on ${process.platform}`);
    \\  }
    \\  libPath = path.join(import.meta.dir, library);
    \\} else {
    \\  libPath = path.join(import.meta.dir, `../../zig-out/lib/libbhk.${suffix}`);
    \\}
    \\
    \\const { symbols, close } = dlopen(libPath, {
    \\
;
const template_2 =
    \\  kill: {
    \\    args: [FFIType.u32, FFIType.u32],
    \\  },
    \\});
    \\
    \\symbols.global__init();
    \\
    \\export const ffi = {
    \\
;
const template_3 =
    \\  close,
    \\  c: {
    \\    kill: symbols.kill,
    \\  }
    \\};
    \\
;
const FFITypeMap = std.ComptimeStringMap([]const u8, .{
    .{ "[*:0]const u8", "FFIType.cstring" },
    .{ "[*]const u8", "FFIType.cstring" },
    .{ "[*c]const u8", "FFIType.cstring" },
    .{ "bool", "FFIType.bool" },
    .{ "u64", "FFIType.u64_fast" },
    .{ "u32", "FFIType.u32" },
    .{ "u16", "FFIType.u16" },
    .{ "u8", "FFIType.u8" },
    .{ "i64", "FFIType.i64_fast" },
    .{ "i32", "FFIType.i32" },
    .{ "i16", "FFIType.i16" },
    .{ "i8", "FFIType.i8" },
    .{ "c_ulong", "FFIType.u64_fast" },
    .{ "void", "FFIType.void" },
});
fn typeToFFIType(comptime t: type) []const u8 {
    const typeName = @typeName(t);
    if (comptime FFITypeMap.get(typeName)) |v| {
        return v ++ " /* " ++ typeName ++ " */";
    } else {
        if (std.mem.startsWith(u8, typeName, "?*") or
            std.mem.startsWith(u8, typeName, "?*") or
            std.mem.startsWith(u8, typeName, "*") or
            std.mem.startsWith(u8, typeName, "[*]") or
            std.mem.startsWith(u8, typeName, "[*c]"))
        {
            return "FFIType.ptr /* " ++ typeName ++ " */";
        } else {
            @compileError("Unknown type: " ++ typeName);
        }
    }
}
pub fn main() !void {
    const file = try std.fs.cwd().createFile("./src/lib/index.ts", .{});
    defer file.close();

    try file.writeAll(template_1);
    inline for (modules) |mod| {
        const mod_type = @typeInfo(mod.val).Struct;
        inline for (mod_type.decls) |dec| {
            if (comptime dec.is_pub) {
                const dec_type = @typeInfo(@TypeOf(@field(mod.val, dec.name)));
                switch (dec_type) {
                    .Fn => |fun| {
                        if (fun.calling_convention == .C) {
                            try file.writeAll("  " ++ mod.name ++ "__" ++ dec.name ++ ": {\n");
                            if (fun.params.len == 0) {
                                try file.writeAll("    args: [],\n");
                            } else {
                                try file.writeAll("    args: [\n");
                                inline for (fun.params) |param| {
                                    try file.writeAll("      " ++ (comptime typeToFFIType(param.type.?)) ++ ",\n");
                                }
                                try file.writeAll("    ],\n");
                            }
                            try file.writeAll("    returns: ");
                            try file.writeAll(comptime typeToFFIType(fun.return_type.?));
                            try file.writeAll(",\n");
                            try file.writeAll("  },\n");
                        }
                    },
                    else => {},
                }
            }
        }
    }
    try file.writeAll(template_2);
    inline for (modules) |mod| {
        const mod_type = @typeInfo(mod.val).Struct;
        try file.writeAll("  " ++ mod.name ++ ": {\n");
        inline for (mod_type.decls) |dec| {
            if (comptime dec.is_pub) {
                const dec_type = @typeInfo(@TypeOf(@field(mod.val, dec.name)));
                switch (dec_type) {
                    .Fn => |fun| {
                        if (fun.calling_convention == .C) {
                            try file.writeAll("    " ++ dec.name ++ ": " ++ "symbols." ++ mod.name ++ "__" ++ dec.name ++ ",\n");
                        }
                    },
                    else => {},
                }
            }
        }
        try file.writeAll("  },\n");
    }
    try file.writeAll(template_3);
}
