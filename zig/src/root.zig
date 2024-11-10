const std = @import("std");

usingnamespace @import("./api.zig");

// fn init_main() !void {
//     js.log("Initializing main");
//     globals = try std.heap.page_allocator.create(Globals);
//     globals.* = Globals.init();

//     js.@"__worker@create"(globals);
// }

// export fn __init_main() void {
//     init_main() catch |err| {
//         js.logFmtSmall(50, "Error initializing main: {s}", .{@errorName(err)});
//     };
// }

// export fn __init_worker(glbPtr: *Globals) void {
//     js.log("Initializing worker");
//     globals = glbPtr;
// }

// inline fn nearestPowerOfTwo(x: u32) u32 {
//     return 1 << (32 - @clz(x - 1));
// }

// export fn allocImageBuffer(width: u32, height: u32) u32 {
//     const buffers = &globals.renderer.frameBuffers;
//     const freeBuffId = buffers.acquireFree(.{ .width = width, .height = height });
//     return freeBuffId;
// }

// export fn getFrameBufferDataPtr(bufferId: u32) [*]u8 {
//     const buffers = &globals.renderer.frameBuffers;
//     return buffers.getData(bufferId).ptr;
// }

// // export fn resizeImageBuffer

// export fn renderToFrameBuffer(bufferId: u32) void {
//     js.logFmtSmall(150, "Rendering image {d}x{d} with buffer {d} and deltaTime {d}", .{ width, height, @intFromPtr(buffer), deltaTime });
//     // js.logFmtSmall(50, "Rendering image {d}x{d} with buffer {d} and deltaTime {f}", .{width, height, @intFromPtr(buffer), deltaTime});
//     // const slice = buffer[0..(width * height * 4)];
//     // const sum = sum_bytes_(slice);
//     // js.logFmtSmall(50, "Sum of buffer: {d}", .{sum});
// }
