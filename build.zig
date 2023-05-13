const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // LIBRARY
    const lib = b.addSharedLibrary(.{
        .name = "bhk",
        .root_source_file = .{ .path = "src/lib/index.zig" },
        .target = target,
        .optimize = optimize,
    });
    lib.linkSystemLibrary("X11");
    lib.linkSystemLibrary("xdo");
    lib.linkLibC();
    b.installArtifact(lib);

    const bindingGenerator = b.addExecutable(.{
        .name = "bhk-binding-generator",
        .root_source_file = .{ .path = "src/lib/index.zig" },
        .optimize = .Debug,
    });
    bindingGenerator.linkSystemLibrary("X11");
    bindingGenerator.linkSystemLibrary("xdo");
    bindingGenerator.linkLibC();
    const run = b.addRunArtifact(bindingGenerator);
    b.default_step.dependOn(&run.step);

    // const demo = b.addExecutable(.{
    //     .name = "demo",
    //     .root_source_file = .{ .path = "src/lib/window-search.zig" },
    //     .target = target,
    //     .optimize = optimize,
    //     .link_libc = true,
    // });
    // demo.linkSystemLibrary("X11");
    // demo.linkSystemLibrary("xdo");
    // b.installArtifact(demo);

    // TESTS
    // const main_tests = b.addTest(.{
    //     .root_source_file = .{ .path = "src/lib/main.zig" },
    //     .target = target,
    //     .optimize = optimize,
    //     .link_libc = true,
    // });
    // main_tests.linkSystemLibrary("x11");
    // main_tests.linkSystemLibrary("xdo");
    // const run_main_tests = b.addRunArtifact(main_tests);

    // const test_step = b.step("test", "Run library tests");
    // test_step.dependOn(&run_main_tests.step);
}
