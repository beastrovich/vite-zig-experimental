const std = @import("std");
const Self = @This();
const Env = @import("./Env.zig");

var _current: ?*Self = null;

pub fn setCurrent(self: *Self) void {
    _current = self;
}

pub fn initialize() void {
    if (_current != null) {
        Env.log("wasm error: Global context already set");
        unreachable;
    }
    const allocated = std.heap.page_allocator.create(Self) catch {
        Env.log("wasm error: Failed to allocate global context");
        unreachable;
    };
    allocated.* = Self{};
    _current = allocated;
}

pub fn current() *Self {
    if (_current == null) {
        Env.log("wasm error: No global context set");
        unreachable;
    }
    return @ptrCast(_current);
}

unique: std.atomic.Value(u32) = std.atomic.Value(u32).init(0),
