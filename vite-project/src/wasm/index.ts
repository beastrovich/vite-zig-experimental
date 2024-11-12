export * from "./process";

// import {
//   ModuleExports,
//   ModuleImports,
//   ModuleMemory,
//   WasmModule,
//   createModule,
// } from "./wasm";

// const FB_HANDLE = Symbol("fb-ptr");
// const FB_MAKE = Symbol("fb-make");

// const HANDLE_TAG = Symbol("handle-tag");
// type HANDLE_TAG = typeof HANDLE_TAG;

// type FrameBufferMake = (ptr: number) => FrameBuffer;

// export type FrameBuffer = {
//   [HANDLE_TAG]: "frame-buffer";

//   readonly isValid: boolean;
//   readonly width: number;
//   readonly height: number;
// };

// namespace FrameBuffer {
//   export function validate(fb: FrameBuffer): asserts fb is FrameBufferImpl {
//     if (!(fb instanceof FrameBufferImpl) && fb.isValid) {
//       throw new Error("Invalid frame buffer");
//     }
//   }
// }
// class FrameBufferImpl implements FrameBuffer {
//   declare [HANDLE_TAG]: "frame-buffer";

//   get isValid() {
//     return this.handle !== 0;
//   }

//   width: number = 0;
//   height: number = 0;
//   handle: number = 0;
//   dataPtr: number = 0;
// }

// export class WasmLib {
//   #wasmModule: WasmModule;

//   private constructor(wasmModule: WasmModule) {
//     this.#wasmModule = wasmModule;
//   }

//   static async create() {
//     const memory = ModuleMemory.create();

//     let exports: ModuleExports;
//     const timerHandler: TimerHandler = (cbPtr: number, statePtr: number) => {
//       exports.__timerCallback(cbPtr, statePtr);
//     };

//     const imports: ModuleImports = {
//       js: {
//         __sysGetCoreCount() {
//           return navigator.hardwareConcurrency;
//         },
//         __consoleLog(ptr, len) {
//           console.log(memory.decodeText(ptr, len));
//         },
//         __setTimeout(timeout, cbPtr, statePtr) {
//           setTimeout(timerHandler, timeout, cbPtr, statePtr);
//         },
//         // __setTimeout(timeout: number)
//       },
//     };

//     const mdl = await createModule(memory, imports);
//     mdl.exports.__initMain();

//     exports = mdl.exports;

//     return new WasmLib(mdl);
//   }

//   createFrameBuffer(width: number, height: number): FrameBuffer | null {
//     const handle = this.#wasmModule.exports.__buffAcquire(width, height);
//     if (handle === 0) {
//       return null;
//     }

//     const ptr = this.#wasmModule.exports.__buffGetPtr(handle);

//     const fb = new FrameBufferImpl();

//     fb.width = width;
//     fb.height = height;
//     fb.handle = handle;
//     fb.dataPtr = ptr;
//     // fb.view =
//     //   ptr == -1
//     //     ? FrameBufferImpl.emptyView
//     //     : new Uint8ClampedArray(
//     //         this.#wasmModule.memory.buffer,
//     //         ptr,
//     //         width * height * 4
//     //       );

//     return fb;
//   }

//   resizeFrameBuffer(fb: FrameBuffer, width: number, height: number) {
//     FrameBuffer.validate(fb);
//     console.log("resizeFrameBuffer", width, height);
//     if (width === fb.width && height === fb.height) {
//       return;
//     }
//     if (width <= 0 || height <= 0) {
//       throw new Error("Invalid dimensions");
//     }
//     if (this.#wasmModule.exports.__buffResize(fb.handle, width, height)) {
//       // if resize happened, update the data pointer
//       fb.dataPtr = this.#wasmModule.exports.__buffGetPtr(fb.handle);
//     }
//     fb.width = width;
//     fb.height = height;
//   }

//   releaseFrameBuffer(fb: FrameBuffer) {
//     FrameBuffer.validate(fb);
//     this.#wasmModule.exports.__buffRelease(fb.handle);
//     fb.handle = 0;
//     fb.dataPtr = 0;
//   }

//   renderToBuffer(fb: FrameBuffer, delta: number) {
//     FrameBuffer.validate(fb);
//     this.#wasmModule.exports.__renderFrame(fb.handle, delta);
//   }

//   getBufferData(fb: FrameBuffer): Uint8ClampedArray {
//     FrameBuffer.validate(fb);
//     return new Uint8ClampedArray(
//       this.#wasmModule.memory.buffer,
//       fb.dataPtr,
//       fb.width * fb.height * 4
//     );
//   }
//   // run() {
//   //   return this.#wasmModule.exports.testus();
//   // }
// }
