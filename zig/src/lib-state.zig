const std = @import("std");
const fb = @import("./frame-buffer.zig");
const jsImport = @import("./js-imports.zig");

const Renderer = struct {
    const Self = @This();

    frameBuffers: fb.FrameBuffers = .{},

    // pub fn init() Self {
    //     return .{
    //         .frameBuffers = fb.FrameBuffers.init(),
    //     };
    // }
};

pub const Globals = struct {
    const Self = @This();

    const GAlloc = std.heap.GeneralPurposeAllocator(.{ .thread_safe = true });

    galloc: GAlloc = .{},
    renderer: Renderer = .{},


    threadJobs: std.ArrayList(*anyopaque) = undefined

    // pub fn init(self: *Self) void {
    // _ = self; // autofix

    // self.galloc = std.heap.GeneralPurposeAllocator(.{ .thread_safe = true }){};
    // self.renderer = Renderer.init();
    // }
};

pub var globals: *Globals = undefined;

// pub inline fn get() *Globals {
//   if (globals == null) {
//     initGlobals(null);
//   }
//   return globals;
// }

pub fn initGlobals() *Globals {
    globals = std.heap.page_allocator.create(Globals) catch |err| {
        jsImport.logFmtSmall(50, "Error initializing globals: {s}", .{@errorName(err)});
        unreachable;
    };
    jsImport.logFmtSmall(100, "Initializing globals at {d}", .{@intFromPtr(globals)});
    globals.* = .{
      .threadJobs = 
    };
    // globals.init();
    return globals;
}

// var globals: *Globals = undefined;
