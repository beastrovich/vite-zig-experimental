const GlobalContext = @import("./GlobalContext.zig");
const App = @import("./App.zig");
const Env = @import("./Env.zig");
const std = @import("std");

var foo: u32 = 1;

pub export fn __wasm_mainStart() void {
    Env.log("zig: __wasm_mainStart");
    GlobalContext.initialize();

    App.main() catch |err| {
        Env.logFmtSmall(50, "Error in main: {s}", .{@errorName(err)});
    };
}
