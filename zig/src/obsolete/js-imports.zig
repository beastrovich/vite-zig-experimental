const std = @import("std");

pub extern "js" fn __consoleLog(s: [*]const u8, sLen: usize) void;
// extern "js" fn __startWorkerPool() void;
pub extern "js" fn __sysGetCoreCount() u16;
pub extern "js" fn __workersStartWorker(globals: *anyopaque, wrkIdx: u32) void;

pub extern "js" fn __setTimeout(timeout: u32, cb: *const fn (*anyopaque) void, state: ?*anyopaque) void;

//     extern "js" fn @"__worker@create"(arg: ?*anyopaque) void;

fn log(s: []const u8) void {
    __consoleLog(s.ptr, s.len);
}

pub fn logFmtSmall(comptime bufferSize: usize, comptime fmt: []const u8, args: anytype) void {
    var buff: [bufferSize]u8 = undefined;
    const printed = std.fmt.bufPrint(&buff, fmt, args) catch {
        log("Error formatting message");
        return;
    };
    log(printed);
}
