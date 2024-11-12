const std = @import("std");
const fb = @import("./frame-buffer.zig");
const libState = @import("./lib-state.zig");
const jsImports = @import("./js-imports.zig");
const wrk = @import("./worker-pool.zig");

export fn testus() u32 {
    return 2;
}

export fn __buffAcquire(width: u32, height: u32) u32 {
    const g = libState.globals;

    const handle = g.renderer.frameBuffers.acquireFree(g.galloc.allocator(), .{ .size = .{ .width = width, .height = height } });
    if (handle == 0) {
        return 0;
    }

    // init buffer to black
    const bufferState = g.renderer.frameBuffers.getBufferState(handle);
    for (0..bufferState.info.size.width * bufferState.info.size.height) |i| {
        bufferState.buffer[i * 4] = 0;
        bufferState.buffer[i * 4 + 1] = 0;
        bufferState.buffer[i * 4 + 2] = 0;
        bufferState.buffer[i * 4 + 3] = 255;
    }

    return handle;
}

export fn __buffGetPtr(bufferId: u32) [*]u8 {
    const g = libState.globals;
    return g.renderer.frameBuffers.buffers[bufferId - 1].ptr;
}

export fn __buffResize(bufferId: u32, width: u32, height: u32) bool {
    const g = libState.globals;
    jsImports.logFmtSmall(100, "Resizing buffer {d} to {d}x{d}", .{ bufferId, width, height });
    g.renderer.frameBuffers.resizeBuffer(g.galloc.allocator(), bufferId, .{ .width = width, .height = height }) catch {
        return false;
    };
    return true;
}

export fn __buffRelease(bufferId: u32) void {
    const g = libState.globals;
    g.renderer.frameBuffers.release(g.galloc.allocator(), bufferId);
}

const Vector2f = struct {
    x: f32,
    y: f32,
};

const Vector2i = struct {
    x: i32,
    y: i32,
};

const fallingSpeed: f32 = 0.00001;
const fallingDots: u32 = 1000;

var fallingDotPos: [fallingDots]Vector2f = undefined;

fn dimBufferSlice(b: []u8) void {
    // Process 4 bytes at a time using simple multiplication
    var i: usize = 0;
    while (i + 3 < b.len) : (i += 4) {
        b[i + 0] = @intCast((@as(u16, @intCast(b[i + 0])) * 253) / 260);
        b[i + 1] = @intCast((@as(u16, @intCast(b[i + 1])) * 253) / 260);
        b[i + 2] = @intCast((@as(u16, @intCast(b[i + 2])) * 253) / 260);
        b[i + 3] = b[i + 3]; // Alpha channel stays unchanged
    }
}

const RenderJob = struct {
    const Self = @This();

    buffer: []u8,

    pub fn run(self: *const Self) void {
        dimBufferSlice(self.buffer);
    }

    pub const WorkerJobImpl: wrk.WorkerJob.VTable = .{
        .run = RenderJob.run,
    };

    pub fn init(buffer: []u8) RenderJob {
        return .{
            .buffer = buffer,
        };
    }

    pub fn workerJob(self: *const Self) wrk.WorkerJob {
        return .{
            .ptr = self,
            .vtable = WorkerJobImpl,
        };
    }
};

fn renderToBuffer(
    target: *const fb.FrameBufferState,
    delta: f32,
) void {
    

    // _ = delta; // autofix
    const g = libState.globals;

    if (g.workers == null) {
        return;
    }
    const workers: *wrk.WorkerMan = @ptrCast(g.workers);

    const w = target.info.size.width;
    const h = target.info.size.height;
    const wf: f32 = @floatFromInt(w);
    const hf: f32 = @floatFromInt(h);

    const len = w * h * 4;

    var alloc = g.frameArena.allocator();

    const split = len / workers.workerCount();
    const remainder = len % workers.workerCount();

    const jobAdder = workers.jobAdder();

    for (0..workers.workerCount()) |i| {
        const job = alloc.create(RenderJob) catch unreachable;
        if (i == workers.workerCount() - 1) {
            job.* = RenderJob.init(target.buffer[i * split..len]);
        } else {
            job.* = RenderJob.init(target.buffer[i * split..(i + 1) * split]);
        }
        workers.
    }

    // const childJobCount = 
    // const RenderJob: wrk.WorkerJob = .{
    //     .ptr =
    // }

    var prng = std.Random.DefaultPrng.init(@bitCast(@as(f64, @floatCast(delta))));
    var r = prng.random();
    {
        const len = w * h * 4;

        // Direct pointer to bytes for maximum speed
        var ptr = target.buffer[0..len];
        _ = ptr; // autofix
    }

    // animate dots
    const movement = fallingSpeed * delta;
    for (0..fallingDots) |i| {
        fallingDotPos[i].y += movement;

        if (fallingDotPos[i].y > 1.0) {
            fallingDotPos[i].y = 0.0;
            fallingDotPos[i].x = r.float(f32);
        }
    }

    // draw dots
    for (0..fallingDots) |i| {
        const x: u32 = @intFromFloat(fallingDotPos[i].x * wf);
        const y: u32 = @intFromFloat(fallingDotPos[i].y * hf);
        const idx: u32 = y * w + x;

        if (idx >= 0 and idx < w * h) {
            target.buffer[idx * 4] = 255;
            target.buffer[idx * 4 + 1] = 255;
            target.buffer[idx * 4 + 2] = 255;
            target.buffer[idx * 4 + 3] = 255;
        }
    }
}

export fn __renderFrame(bufferId: u32, delta: f32) void {
    const g = libState.globals;
    const bufferState = g.renderer.frameBuffers.getBufferState(bufferId);

    renderToBuffer(&bufferState, delta);
}

export fn __initMain() void {
    _ = libState.initGlobals();
    _ = libState.globals.startWorkerManager();

    var prng = std.Random.DefaultPrng.init(0);
    var r = prng.random();
    // intialize dots to random positions
    for (0..fallingDots) |i| {
        fallingDotPos[i] = .{
            .x = r.float(f32),
            .y = r.float(f32),
        };
    }
}

export fn __timerCallback(callback: *anyopaque, state: *anyopaque) void {
    const cb: *const fn (*anyopaque) void = @ptrCast(callback);
    cb(state);
}

export fn __runWorker(globals: *libState.Globals, idx: u32) void {
    libState.globals = globals;
    const g = globals;
    if (g.workers == null) {
        return;
    }
    const workers: *wrk.WorkerMan = @ptrCast(g.workers);

    while (true) {
        workers.workerWaitReady();

        const jobs = workers.jobBuffers[idx];

        for (jobs.constSlice()) |job| {
            job.vtable.run(job.ptr);
        }
    }
}
