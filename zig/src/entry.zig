const GlobalContext = @import("./GlobalContext.zig");
const App = @import("./App.zig");
const Env = @import("./Env.zig");

var foo: u32 = 1;

pub export fn __wasm_mainStart() void {
    Env.log("zig: __wasm_mainStart");
    GlobalContext.initialize();

    App.main();
}

pub export fn __wasm_workerStart(global_context_ptr: *GlobalContext, function: *const anyopaque, data_ptr: ?*anyopaque) void {
    Env.log("zig: __wasm_workerStart");
    GlobalContext.setCurrent(global_context_ptr);

    // _ = global_context_ptr; // autofix
    const fnPtr: *const fn (?*anyopaque) void = @ptrCast(function);
    // // log foo
    // Env.logFmtSmall(100, "foo: {d}", .{foo});

    fnPtr(data_ptr);
}
