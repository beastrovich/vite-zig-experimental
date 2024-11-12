const std = @import("std");
const buffUtils = @import("./buffer-utils.zig");
const jsImports = @import("./js-imports.zig");

pub const Size = extern struct {
    width: u32 = 0,
    height: u32 = 0,
};

pub const FrameBufferInfo = struct {
    size: Size = .{},
};

pub const FrameBufferState = struct {
    info: FrameBufferInfo = .{},
    buffer: []u8 = &[_]u8{},
};

pub const FrameBuffers = struct {
    const Self = @This();

    // bitset of occupied framebuffers
    occupied: u32 = 0,

    infos: [32]FrameBufferInfo = [_]FrameBufferInfo{.{}} ** 32,
    buffers: [32][]u8 = [_][]u8{&[_]u8{}} ** 32,
    // allocator: *std.mem.Allocator = undefined,

    pub fn init() Self {
        return .{};
    }

    pub fn acquireFree(self: *Self, allocator: std.mem.Allocator, info: FrameBufferInfo) u32 {
        const idx: u5 = @intCast(@ctz(~self.occupied));
        if (idx == 32) {
            return 0;
        }

        const minLength = info.size.width * info.size.height * 4;
        self.buffers[idx] = buffUtils.allocPow2Buffer(
            allocator,
            minLength,
        ) catch |err| {
            // log error
            jsImports.logFmtSmall(100, "Error allocating buffer: {s}", .{@errorName(err)});
            return 0;
        };

        self.occupied |= @as(u32, 1) << idx;
        self.infos[idx] = info;

        return idx + 1;
    }

    pub fn resizeBuffer(self: *Self, allocator: std.mem.Allocator, bufferId: u32, newSize: Size) !void {
        const idx = bufferId - 1;
        const newLen = newSize.width * newSize.height * 4;
        try buffUtils.reallocPow2Buffer(allocator, &self.buffers[idx], newLen);
        self.infos[idx].size = newSize;
    }

    pub fn release(self: *Self, allocator: std.mem.Allocator, bufferId: u32) void {
        const idx: u5 = @intCast(bufferId - 1);

        if ((self.occupied >> idx) & 1 == 0) {
            return;
        }

        allocator.free(self.buffers[idx]);
        self.buffers[idx] = &[_]u8{};

        self.occupied &= ~(@as(u32, 1) << idx);
    }

    pub fn getBufferState(self: *Self, bufferId: u32) FrameBufferState {
        const idx = bufferId - 1;
        return .{
            .info = self.infos[idx],
            .buffer = self.buffers[idx],
        };
    }

    pub fn getData(self: *Self, bufferId: u32) []u8 {
        const idx = bufferId - 1;
        return self.buffers[idx];
    }
};

// pub const FrameBuffer = struct {
//     const Self = @This();

//     size: Size = .{ .width = 0, .height = 0 },
//     buffer: []u8 = &[_]u8{},

//     pub fn init(allocator: *std.mem.Allocator, width: u32, height: u32) FrameBuffer {
//         const desiredLen = width * height * 4;
//         if (desiredLen == 0) {
//             return .{};
//         }

//         const len = nearestPowerOfTwo(desiredLen);

//         const buffer = allocator.alloc(u8, len) catch {
//             return .{};
//         };
//         return .{
//             .size = .{ .width = width, .height = height },
//             .buffer = buffer,
//         };
//     }

//     pub fn deinit(self: *Self, allocator: *std.mem.Allocator) void {
//         if (self.buffer.len == 0) {
//             return;
//         }

//         allocator.free(self.buffer);
//         self.buffer = &[_]u8{};
//         self.size = .{ .width = 0, .height = 0 };
//     }

//     const ResizeResult = enum(u32) {
//         Success = 0,
//         OutOfMemory,
//         NoResizeNeeded,
//     };

//     pub fn resize(self: *Self, allocator: *std.mem.Allocator, width: u32, height: u32) ResizeResult {
//         const desiredLen = width * height * 4;
//         if (desiredLen == 0 and self.buffer.len > 0) {
//             allocator.free(self.buffer);
//             return ResizeResult.Success;
//         }

//         const len = nearestPowerOfTwo(desiredLen);

//         if (len == self.buffer.len) {
//             return ResizeResult.NoResizeNeeded;
//         }
//         const buffer = allocator.realloc(self.buffer, u8, len) catch {
//             return ResizeResult.OutOfMemory;
//         };
//         self.size.width = width;
//         self.size.height = height;
//         self.buffer = buffer;
//         return ResizeResult.Success;
//     }
// };

// const FrameBuffers = struct {
//     const Self = @This();

//     // bitset of occupied framebuffers
//     occupied: u32 = 0,
//     buffers: [32]FrameBuffer = .{},
//     allocator: *std.mem.Allocator = undefined,

//     pub fn init(allocator: *std.mem.Allocator) Self {
//         return .{
//             .allocator = allocator,
//         };
//     }

//     pub fn deinit(self: *Self) void {
//         for (self.buffers, 0..) |buff, i| {
//             if ((self.occupied >> i) & 1) {
//                 buff.deinit(self.allocator);
//             }
//         }
//         self.occupied = 0;
//         self.allocator = undefined;
//     }

//     pub fn acquireFree(self: *Self, minSize: Size) u32 {
//         const idx = @ctz(~self.occupied);
//         if (idx == 32) {
//             return 0;
//         }
//         self.occupied |= 1 << idx;

//         self.buffers[idx] = FrameBuffer.init(minSize.width, minSize.height);

//         return idx + 1;
//     }

//     pub fn release(self: *Self, bufferId: u32) void {
//         const idx = bufferId - 1;

//         self.buffers[idx].deinit(self.allocator);
//         self.occupied &= ~(1 << idx);
//     }

//     pub fn getData(self: *Self, bufferId: u32) []u8 {
//         const idx = bufferId - 1;
//         return self.buffers[idx];
//     }
// };
