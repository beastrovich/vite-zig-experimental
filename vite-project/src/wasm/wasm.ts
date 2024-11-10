import wasmUrl from "./wasm.wasm?url";

export type ModuleImports = {
  js: {
    "__console@log"(ptr: number, len: number): void;
  };
};

export type ModuleExports = {
  __buffAcquire(width: number, height: number): number;
  __buffRelease(handle: number): void;
  __buffGetPtr(handle: number): number;
  __buffResize(handle: number, width: number, height: number): boolean;
  __renderFrame(handle: number, delta: number): void;
  __initMain(): void;
  __initWorker(globalsPtr: number): void;
  testus(): number;
};

export namespace ModuleMemoryTransferable {
  export const TAG = Symbol("ModuleMemoryTransferable");
  export type Type = typeof TAG;
}

export type ModuleMemoryTransferable = { [ModuleMemoryTransferable.TAG]: true };

const MEM = Symbol("ModuleMemory");

export class ModuleMemory {
  [MEM]: WebAssembly.Memory;
  // view: Uint8ClampedArray;
  get buffer() {
    return this[MEM].buffer;
  }

  #decoder = new TextDecoder();

  private constructor(memory: WebAssembly.Memory) {
    this[MEM] = memory;
    // this.view = new Uint8ClampedArray(memory.buffer);
  }

  static create() {
    const maxMegs = 1024; // 4GB
    const maxInPages = Math.ceil((maxMegs * 1024) / 64);

    return new ModuleMemory(
      new WebAssembly.Memory({
        initial: 256,
        maximum: maxInPages,
        shared: true,
      })
    );
  }

  static from(transferable: ModuleMemoryTransferable) {
    const mem = transferable as unknown as WebAssembly.Memory;
    if (!(mem instanceof WebAssembly.Memory)) {
      throw new Error("Invalid transferable");
    }
    return new ModuleMemory(mem);
  }

  decodeText(start: number, len: number) {
    const sharedBuffer = this[MEM].buffer;
    const copyLength = Math.min(sharedBuffer.byteLength, len);

    // Create a temporary ArrayBuffer and copy the contents of the shared buffer
    // into it.
    const tempBuffer = new ArrayBuffer(copyLength);
    const tempView = new Uint8Array(tempBuffer);

    let sharedView = new Uint8Array(sharedBuffer);

    if (sharedBuffer.byteLength != copyLength) {
      sharedView = sharedView.subarray(start, start + copyLength);
    }
    tempView.set(sharedView);

    return this.#decoder.decode(tempBuffer);
  }
}

export async function createModule(
  memory: ModuleMemory,
  imports: ModuleImports
) {
  const instSource = await WebAssembly.instantiateStreaming(fetch(wasmUrl), {
    env: {
      memory: memory[MEM],
    },
    ...imports,
  });

  return {
    memory: memory,
    exports: instSource.instance.exports,
  } as WasmModule;
}

export type WasmModule = {
  memory: ModuleMemory;
  exports: ModuleExports;
};

// export type WasmModulePub = Omit<WasmModule, "__init_main">;
