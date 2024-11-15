extern "sys" fn cpuCount() u32;

pub fn declareMain(comptime f: anytype) void {
    const fn_type = @TypeOf(f);
    const fn_type_info = @typeInfo(fn_type);
    // fn_type_info.Fn
    if (fn_type_info != .Fn) {
        @compileError("main_fn must be a function");
    }

    const handle = (switch (@typeInfo(@typeInfo(fn_type).Fn.return_type.?)) {
        .ErrorUnion => struct {
            fn handle() callconv(.C) void {
                @call(.always_inline, f, .{}) catch unreachable;
            }
            // @compileError("main_fn must not return an error union");
        },
        .Void => struct {
            fn handle() callconv(.C) void {
                @call(.always_inline, f, .{});
            }
        },
        else => @compileError("main_fn return type is not supported"),
    }).handle;

    @export(handle, .{ .name = "__wasm_mainStart" });
}
