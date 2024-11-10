const std = @import("std");
const jsImports = @import("./js-imports.zig");

const WorkerJob = struct {
    pub const VTable = struct {
        run: fn(*anyopaque) void,
    };

    ptr: *anyopaque,
    vtable: VTable,
};

const WorkerState = struct {
    const WorkerJobs = std.BoundedArray(WorkerJob, 16);

    jobs: WorkerJobs,
};

const WorkerMan = struct {
    const Self = @This();
    const Workers = []WorkerState;

    jobsCompleted: std.Thread.WaitGroup,
    
    workers: Workers = undefined,
};

pub fn createWor

pub fn startWorkerPool(allocator: std.mem.Allocator) void {
    WorkerMan.__startWorkerPool();
}
