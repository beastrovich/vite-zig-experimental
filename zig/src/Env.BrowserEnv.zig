const std = @import("std");
const Self = @This();
const GlobalContext = @import("./GlobalContext.zig");

extern "js" fn __sysGetCoreCount() u16;

extern "js" fn __consoleLog(s: [*]const u8, sLen: usize) void;
extern "js" fn __workerStart(global_context_ptr: *GlobalContext, function: *const anyopaque, data_ptr: ?*anyopaque, idx: u32) void;

pub inline fn log(s: []const u8) void {
    __consoleLog(s.ptr, s.len);
}

pub inline fn cpuCount() u16 {
    return __sysGetCoreCount();
}

pub fn startThread(startFn: *const fn (?*anyopaque) void, data: ?*anyopaque) void {
    const g = GlobalContext.current();
    const idx = g.thread_idx;
    g.thread_idx += 1;

    // var fmtBuff: [200]u8 = undefined;
    // const printed = std.fmt.bufPrint(&fmtBuff, "startThread: {d}, {d}", .{
    //     @intFromPtr(g),
    //     g.thread_idx,
    // }) catch {
    //     log("Error formatting message");
    //     return;
    // };
    // log(printed);
    // _ = data; // autofix
    // log("startThread");
    // _ = startFn;
    // _ = data;
    // const ctx: *GlobalContext = GlobalContext.current();
    // const startFnOp: *const fn (*anyopaque) void = @ptrCast(startFn);
    // const dataOp: *anyopaque = @ptrCast(data);

    // var buff: [200]u8 = undefined;
    // const printed = std.fmt.bufPrint(&buff, "startThread: {d}, {d}, {d}", .{
    //     @intFromPtr(GlobalContext.current()),
    //     @intFromPtr(startFn),
    //     @intFromPtr(data),
    // }) catch {
    //     log("Error formatting message");
    //     return;
    // };
    // log(printed);

    __workerStart(
        g,
        startFn,
        data,
        idx,
    );
    // Impl.startThread(startFn, data);
}
