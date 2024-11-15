const std = @import("std");

const __log = @extern(*const fn ([*]const u8, usize) callconv(.C) void, .{
    .name = "log",
    .library_name = "console",
});

pub inline fn log(s: []const u8) void {
    __log(s.ptr, s.len);
}

pub fn logFmtSmall(comptime bufferSize: usize, comptime fmt: []const u8, args: anytype) void {
    var buff: [bufferSize]u8 = undefined;
    const printed = std.fmt.bufPrint(&buff, fmt, args) catch {
        log("Error formatting message");
        return;
    };
    log(printed);
}
