import wasmUrl from "./wasm.wasm?url";

export type ModuleImports = {
  sys: {
    cpuCount(): number;
  };
  console: {
    log(ptr: number, len: number): void;
  };
  web_worker: {
    start(ptr: number): void;
  };
};

export type ModuleExports = {
  __wasm_mainStart(): void;
  __wasm_threadStart(ptr: number): void;

  // __buffAcquire(width: number, height: number): number;
  // __buffRelease(handle: number): void;
  // __buffGetPtr(handle: number): number;
  // __buffResize(handle: number, width: number, height: number): boolean;
  // __renderFrame(handle: number, delta: number): void;
  // __initMain(): void;
  // __timerCallback(cbPtr: number, statePtr: number): void;
  // __initWorker(globalsPtr: number): void;
  // testus(): number;
};

export function createMemory() {
  const maxMegs = 1024; // 4GB
  const maxInPages = Math.ceil((maxMegs * 1024) / 64);

  return new WebAssembly.Memory({
    // initial: 256 * 10,
    initial: 3000,
    maximum: maxInPages,
    shared: true,
  });
}

export async function createModule(
  memory: WebAssembly.Memory,
  imports: ModuleImports
) {
  const instSource = await WebAssembly.instantiateStreaming(fetch(wasmUrl), {
    env: {
      memory: memory,
    },
    ...imports,
  });

  return {
    memory: memory,
    exports: instSource.instance.exports,
  } as WasmModule;
}

export type WasmModule = {
  memory: WebAssembly.Memory;
  exports: ModuleExports;
};
