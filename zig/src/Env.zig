const std = @import("std");

const Self = @This();
const builtin = @import("builtin");

const Impl = if (builtin.target.isWasm() and builtin.target.os.tag == .freestanding)
    @import("./Env.BrowserEnv.zig")
else
    @compileError("Unsupported target");

pub fn log(s: []const u8) void {
    Impl.log(s);
}

pub fn logFmtSmall(comptime bufferSize: usize, comptime fmt: []const u8, args: anytype) void {
    var buff: [bufferSize]u8 = undefined;
    const printed = std.fmt.bufPrint(&buff, fmt, args) catch {
        log("Error formatting message");
        return;
    };
    log(printed);
}

pub fn startThread(startFn: *const fn (?*anyopaque) void, data: ?*anyopaque) void {
    Impl.startThread(startFn, data);
}
