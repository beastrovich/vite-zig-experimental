const std = @import("std");
const Self = @This();
const Env = @import("./Env.zig");
const GlobalContext = @import("./GlobalContext.zig");

/// Asks the host to create a new thread for us.
/// Newly created thread will call `wasi_tread_start` with the thread ID as well
/// as the input `arg` that was provided to `spawnWasiThread`
// const spawnWasiThread = @"thread-spawn";
// extern "wasi" fn @"thread-spawn"(arg: *Instance) i32;

fn spinWait(iterations: u32) void {
    var i: u32 = 0;
    var x: u32 = 1;
    while (i < iterations) : (i += 1) {
        x = x *% 31 +% 1;
    }
    std.mem.doNotOptimizeAway(x);
}

fn startFn() void {
    const g = GlobalContext.current();
    // _ = g; // autofix
    // _ = data;
    const id = g.unique.fetchAdd(1, .monotonic);

    // Create a stack buffer to test
    var stack_buffer: [256]u8 = undefined;
    var prng = std.rand.DefaultPrng.init(@as(u64, id));
    var rand = prng.random();

    const NUM_ITERATIONS = 100;
    var iter: usize = 0;
    while (iter < NUM_ITERATIONS) : (iter += 1) {
        // Fill buffer with thread-unique pattern
        for (stack_buffer[0..], 0..) |*b, i| {
            b.* = @truncate(id +% i +% @as(u8, @truncate(iter)));
        }

        // Random delay between write and check
        // spinWait(rand.intRangeAtMost(u32, 100, 10000));

        // Verify buffer hasn't been corrupted
        var corrupted = false;
        var corrupt_offset: usize = 0;
        var corrupt_value: u8 = 0;
        var expected_value: u8 = 0;

        for (stack_buffer[0..], 0..) |b, i| {
            const expected = @as(u8, @truncate(id +% i +% @as(u8, @truncate(iter))));
            if (b != expected) {
                corrupted = true;
                corrupt_offset = i;
                corrupt_value = b;
                expected_value = expected;
                break;
            }
        }

        if (corrupted) {
            Env.logFmtSmall(500, "Thread {d} iter {d} stack corruption at 0x{x} offset {d}: expected {d}, got {d}", .{
                id,
                iter,
                @intFromPtr(&stack_buffer) + corrupt_offset,
                corrupt_offset,
                expected_value,
                corrupt_value,
            });
            // Continue testing to see if corruption persists
        }

        // Random delay before next iteration
        spinWait(rand.intRangeAtMost(u32, 100, 10000));
    }

    Env.logFmtSmall(100, "Thread {d} completed {d} iterations at stack 0x{x}", .{ id, NUM_ITERATIONS, @intFromPtr(&stack_buffer) });
    // if (id < 20) {
    //     Env.startThread(&startFn, null);
    //     // Env.log("Thread 0 exiting");
    // }
}

pub fn main() !void {
    try Env.startThread(startFn, .{});
    try Env.startThread(startFn, .{});
    try Env.startThread(startFn, .{});
    try Env.startThread(startFn, .{});
    try Env.startThread(startFn, .{});
    try Env.startThread(startFn, .{});
    try Env.startThread(startFn, .{});
    // Env.startThread(&startFn, null);
    // Env.startThread(&startFn, null);
}
