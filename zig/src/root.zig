const std = @import("std");

const globals_struct = struct {
    galloc: std.heap.GeneralPurposeAllocator(.{ .thread_safe = true }) = .{},
    testusBuff: [100]u8 = undefined,
    testus: []const u8 = &[_]u8{},
};

var globals: *globals_struct = undefined;

fn init_main() !void {
    js.log("Initializing main");
    globals = try std.heap.page_allocator.create(globals_struct);
    globals.* = .{};
    globals.testus = std.fmt.bufPrint(&globals.testusBuff, "testus", .{}) catch unreachable;
    // js.log(globals.testus);
    js.@"__worker@create"(globals);
}

export fn __init_main() void {
    init_main() catch |err| {
        var msg_buff: [100]u8 = undefined;
        const printed = std.fmt.bufPrint(&msg_buff, "Error initializing main: {s}", .{@errorName(err)}) catch {
            js.log("Error formatting error message");
            return;
        };
        js.log(printed);
    };
}

export fn __init_worker(glbPtr: *globals_struct) void {
    js.log("Initializing worker");
    // print pointer value
    var buff: [100]u8 = undefined;
    js.log(std.fmt.bufPrint(&buff, "testus: {d}", .{@intFromPtr(glbPtr)}) catch unreachable);

    globals = glbPtr;

    js.log(globals.testus);
}

// fn start_thread(start_fn: fn(?*anyopaque) void, user_data: ?*anyopaque) void {

// }

// export fn init_worker(globals_ptr: *globals_struct) void {
//     globals = globals_ptr.*;
// }

// export fn thread_start(start_fn: *const fn (*anyopaque) callconv(.C) void, user_data: *anyopaque) void {
//     start_fn(user_data);
// }

// // var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);

// // const globals = struct {

// // };

const js = struct {
    extern "js" fn @"__console@log"(s: [*]const u8, sLen: usize) void;

    extern "js" fn @"__worker@create"(arg: ?*anyopaque) void;

    fn log(s: []const u8) void {
        @"__console@log"(s.ptr, s.len);
    }
};

// fn log(s: []const u8) void {
//     x.log(s.ptr, s.len);
// }

// var buff_ptr: [*]const upa8 = 0;
// var buff_len: usize = 0;

// export fn set_buff(s: [*]const u8, sLen: usize) void {
//     buff_ptr = s;
//     buff_len = sLen;
// }

// fn sum_bytes_(src: []const u8) u32 {
//     var sum: u32 = 0;
//     for (src) |byte| {
//         sum += byte;
//     }
//     return sum;
// }

// export fn sum_bytes(len: usize, src: [*]const u8) u32 {
//     const slice = src[0..len];
//     return sum_bytes_(slice);
// }

// export fn alloc_scratch(len: u8) ?[*]u8 {
//     const mem = (arena.allocator().alloc(u8, len) catch {
//         return null;
//     });
//     return mem.ptr;
// }

// export fn free_scratch() void {
//     _ = arena.reset(.free_all);
// }

// export fn alloc(len: u8) ?[*]u8 {

//     const mem = (std.heap.page_allocator.alloc(u8, len) catch {
//         return null;
//     });
//     return mem.ptr;
// }

// export fn free(mem: [*]u8) void {std.heap.page_allocator.free(mem);
// }

// const blah = "blah";

// export const blah_ptr = blah.ptr;
// export const blah_len = blah.len;

// export fn run() void {
//     x.log(x.buff_ptr, x.buff_len);
// }
