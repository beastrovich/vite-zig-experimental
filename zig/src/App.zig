// const Self = @This();
const Env = @import("./Env.zig");
const GlobalContext = @import("./GlobalContext.zig");

fn startFn(data: ?*anyopaque) void {
    const g = GlobalContext.current();
    // g.
    _ = data; // autofix
    const id = g.unique.fetchAdd(1, .monotonic);
    Env.logFmtSmall(100, "startFn: {d}", .{id});
}

pub fn main() void {
    Env.startThread(&startFn, null);
    Env.startThread(&startFn, null);
    Env.startThread(&startFn, null);
}
