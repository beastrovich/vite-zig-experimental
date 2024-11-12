const std = @import("std");
const jsImports = @import("./js-imports.zig");

fn nearestPowerOfTwo(x: u32) u32 {
    if (x == 0) {
        return 0;
    }
    return @as(u32, 1) << @as(u5, @intCast(32 - @clz(x - 1)));
}

pub fn allocPow2Buffer(allocator: std.mem.Allocator, minLength: usize) ![]u8 {
    const length = nearestPowerOfTwo(minLength);
    jsImports.logFmtSmall(100, "Allocating buffer of size {d}", .{length});
    const ptr = try allocator.alloc(u8, length);
    return ptr;
}

pub fn reallocPow2Buffer(allocator: std.mem.Allocator, target: *[]u8, minLength: usize) !void {
    const length = nearestPowerOfTwo(minLength);
    // jsImports.logFmtSmall(100, "Reallocating buffer from {d} to {d}", .{ target.len, length });
    if (target.len == length) {
        return;
    }
    // jsImports.logFmtSmall(100, "Reallocating buffer from {d} to {d}", .{ target.len, length });
    target.* = try allocator.realloc(target.*, length);
}
