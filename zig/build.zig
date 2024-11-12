const std = @import("std");

// Although this function looks imperative, note that its job is to
// declaratively construct a build graph that will be executed by an external
// runner.
pub fn build(b: *std.Build) void {
    const features = std.Target.wasm.featureSet(&[_]std.Target.wasm.Feature{
        .bulk_memory,
        .atomics,
        .simd128,
    });

    const target = b.resolveTargetQuery(.{ .cpu_arch = .wasm32, .os_tag = .freestanding, .cpu_features_add = features });

    // const optimize = b.standardOptimizeOption(.{ .preferred_optimize_mode = .ReleaseFast });

    const wasmArt = b.addExecutable(.{
        .name = "wasm",
        // In this case the main source file is merely a path, however, in more
        // complicated build scripts, this could be a generated file.
        .root_source_file = b.path("src/root.zig"),
        .target = target,
        .optimize = .ReleaseSafe,
        .single_threaded = false,
    });

    wasmArt.rdynamic = true;
    wasmArt.entry = .disabled;
    wasmArt.import_memory = true;
    wasmArt.shared_memory = true;

    const pageSize: usize = 64 * 1024;
    const mibi: usize = 1024 * 1024;
    const maxMem: usize = 1024 * 4 * mibi;

    // Align max memory to page size using modulo
    // to the nearest larger or same page size
    const pageAlignedMaxMem = (maxMem + pageSize - 1) & ~(pageSize - 1);
    // std.debug.print("maxMem: {d}\n", .{maxMem});
    wasmArt.max_memory = pageAlignedMaxMem;

    // wasmArt.enable_feature();

    // const buildPath: []const u8 = if (b.build_root.path == null) {
    //     @as(&[]u8, "build");
    // } else {
    //     b.build_root.path;
    // };
    // const pth = b.pathResolve(&[_][]u8{ buildPath, "foo" });

    // const pth = b.pathResolve(&[_][]u8{ b.build_root.path,    "foo" });
    // std.debug.print("pth: {?s}\n", .{b.dest_dir});
    // b.install_prefix = "fwefwe";
    // b.installArtifact(wasmArt);
    // b.install_prefix = b.pathResolve(.{"foo"});
    const installArt = b.addInstallArtifact(wasmArt, .{ .dest_dir = .{ .override = .{ .custom = "../../vite-project/src/wasm/process" } } });

    b.getInstallStep().dependOn(&installArt.step);
    // // Creates a step for unit testing. This only builds the test executable
    // // but does not run it.
    // const lib_unit_tests = b.addTest(.{
    //     .root_source_file = b.path("src/root.zig"),
    //     .target = target,
    //     .optimize = optimize,
    // });

    // const run_lib_unit_tests = b.addRunArtifact(lib_unit_tests);

    // const exe_unit_tests = b.addTest(.{
    //     .root_source_file = b.path("src/main.zig"),
    //     .target = target,
    //     .optimize = optimize,
    // });

    // const run_exe_unit_tests = b.addRunArtifact(exe_unit_tests);

    // // Similar to creating the run step earlier, this exposes a `test` step to
    // // the `zig build --help` menu, providing a way for the user to request
    // // running the unit tests.
    // const test_step = b.step("test", "Run unit tests");
    // test_step.dependOn(&run_lib_unit_tests.step);
    // // test_step.dependOn(&run_exe_unit_tests.step);
}
