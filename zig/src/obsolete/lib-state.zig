const std = @import("std");
const fb = @import("./frame-buffer.zig");
const jsImport = @import("./js-imports.zig");
const wrk = @import("./worker-pool.zig");

const Renderer = struct {
    const Self = @This();

    frameBuffers: fb.FrameBuffers = .{},
};

pub const Globals = struct {
    const Self = @This();

    const GAlloc = std.heap.GeneralPurposeAllocator(.{ .thread_safe = true });

    galloc: GAlloc = .{},
    renderer: Renderer = .{},

    workers: ?*wrk.WorkerMan = null,

    frameArena: std.heap.ArenaAllocator,

    pub fn startWorkerManager(self: *Self) *wrk.WorkerMan {
        if (self.workers == null) {
            self.workers = wrk.createWorkerManager(self.galloc.allocator()) catch |err| {
                jsImport.logFmtSmall(50, "Error initializing worker manager: {s}", .{@errorName(err)});
                unreachable;
            };
        }
        return @ptrCast(self.workers);
    }

    pub fn init() Self {
        const galloc = GAlloc{};
        const alloc = galloc.allocator();
        const frameArena = std.heap.ArenaAllocator.init(alloc);
        return .{
            .galloc = galloc,
            .frameArena = frameArena,
        };
    }
};

pub var globals: *Globals = undefined;

pub fn initGlobals() *Globals {
    globals = std.heap.page_allocator.create(Globals) catch |err| {
        jsImport.logFmtSmall(50, "Error initializing globals: {s}", .{@errorName(err)});
        unreachable;
    };
    jsImport.logFmtSmall(100, "Initializing globals at {d}", .{@intFromPtr(globals)});
    globals.* = Globals.init();

    return globals;
}

// var globals: *Globals = undefined;
