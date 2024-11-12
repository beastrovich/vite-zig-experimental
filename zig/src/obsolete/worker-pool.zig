const std = @import("std");
const Allocator = std.mem.Allocator;
const Futex = std.Thread.Futex;
const jsImports = @import("./js-imports.zig");

pub const WorkerJob = struct {
    pub const VTable = struct {
        run: *const fn (*anyopaque) void,
    };

    ptr: *anyopaque,
    vtable: VTable,
};

pub const CondVar = struct {
    wait_var: std.atomic.Value(u32) = std.atomic.Value(u32).init(0),

    pub fn init() CondVar {
        return .{};
    }

    pub fn wait(self: *CondVar, mutex: *std.Thread.Mutex) void {
        const current = self.wait_var.load(.acquire);
        mutex.unlock();
        std.Thread.Futex.wait(&self.wait_var, current);
        mutex.lock();
    }

    pub fn signal(self: *CondVar) void {
        self.wait_var.fetchAdd(1, .release);
        std.Thread.Futex.wake(&self.wait_var, 1);
    }

    pub fn broadcast(self: *CondVar) void {
        self.wait_var.fetchAdd(1, .release);
        std.Thread.Futex.wake(&self.wait_var, std.math.maxInt(u32));
    }
};

const WorkerSignaling = struct {
    state: std.atomic.Value(u32) = std.atomic.Value(u32).init(0),
    work_ready: std.atomic.Value(bool) = std.atomic.Value(bool).init(false),
    running_count: std.atomic.Value(u32) = std.atomic.Value(u32).init(0),

    pub fn init() WorkerSignaling {
        return .{};
    }

    pub fn waitForWork(self: *WorkerSignaling) void {
        while (true) {
            // Load current sequence number first
            const current_seq = self.state.load(.acquire);

            if (self.work_ready.load(.acquire)) {
                // Check sequence again to ensure we're in same frame
                if (self.state.load(.acquire) == current_seq) {
                    break;
                }
            }
            std.Thread.Futex.wait(&self.state, current_seq);
        }
    }

    pub fn workDone(self: *WorkerSignaling) void {
        if (self.running_count.fetchSub(1, .release) == 1) {
            self.state.fetchAdd(1, .release);
            std.Thread.Futex.wake(&self.state, 1);
        }
    }

    pub fn waitUntilDone(self: *WorkerSignaling) void {
        while (true) {
            // Load current sequence number first
            const current_seq = self.state.load(.acquire);

            if (self.running_count.load(.acquire) == 0) {
                break;
            }

            std.Thread.Futex.wait(&self.state, current_seq);
        }
    }

    pub fn notifyWorkers(self: *WorkerSignaling, worker_count: u32) void {
        self.work_ready.store(true, .release);
        self.state.fetchAdd(1, .release);
        self.running_count.store(worker_count, .release);
        std.Thread.Futex.wake(&self.state, std.math.maxInt(u32));
    }

    pub fn reset(self: *WorkerSignaling) void {
        self.work_ready.store(false, .release);
        // No need to modify state here as it's incremented in notifyWorkers
    }
};

pub const WorkerJobAdder = struct {
    const Self = @This();

    man: *WorkerMan,
    workerIdx: u32 = 0,

    pub fn init(man: *WorkerMan) WorkerJobAdder {
        return .{
            .man = man,
        };
    }

    pub fn nextWorker(self: *Self) u32 {
        if (self.workerIdx >= self.man.workerCount()) {
            @panic("No more workers available");
        }
        self.workerIdx += 1;
    }

    pub fn addJob(self: *Self, job: WorkerJob) void {
        self.man.addWorkerJob(self.workerIdx, job);
    }

    pub fn reset(self: *Self) void {
        self.workerIdx = 0;
    }
};

pub const WorkerMan = struct {
    const Self = @This();
    const WorkerJobs = std.BoundedArray(WorkerJob, 16);

    mutex: std.Thread.Mutex = .{},

    workers_notify_cond: CondVar = CondVar.init(),
    main_notify_cond: CondVar = CondVar.init(),

    running_count: u32 = 0,

    jobBuffers: []WorkerJobs = &[_]WorkerJobs{},

    pub fn jobAdder(self: *Self) WorkerJobAdder {
        return WorkerJobAdder.init(self);
    }

    pub fn workerCount(self: *WorkerMan) u32 {
        return self.jobBuffers.len;
    }

    pub fn addWorkerJob(self: *WorkerMan, idx: u32, job: WorkerJob) void {
        self.jobBuffers[idx].append(job);
    }

    pub fn runJobs(self: *WorkerMan) void {
        self.mutex.lock();

        self.running_count = self.workerCount();

        self.mutex.unlock();

        self.workers_notify_cond.broadcast();
    }

    pub fn workerWaitReady(self: *Self) void {
        self.mutex.lock();
        self.workers_notify_cond.wait(&self.mutex);
        self.mutex.unlock();
    }

    pub fn waitUntilDone(self: *WorkerMan) void {
        self.mutex.lock();
        while (self.running_count > 0) {
            self.main_notify_cond.wait(&self.mutex);
        }
        self.mutex.unlock();
    }
};

pub fn createWorkerManager(allocator: Allocator) !*WorkerMan {
    const man = try allocator.create(WorkerMan);
    const cores = jsImports.__sysGetCoreCount();
    std.Thread.Condition
    man.* = .{
        .jobBuffers = try allocator.alloc(WorkerMan.WorkerJobs, cores),
    };

    return man;
}

// pub fn startWorkerPool(allocator: Allocator) void {
//     WorkerMan.__startWorkerPool();
// }
