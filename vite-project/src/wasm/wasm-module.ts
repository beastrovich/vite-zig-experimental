import createWasm from "./blob.wasm?init";
import JobWorker from "./job.worker?worker";

const IMPORT_FACTORY = Symbol("import factory");
type IMPORT_FACTORY = typeof IMPORT_FACTORY;

type ModuleGlobals = {
  memory: WebAssembly.Memory;
};

function importFactory(fn: (g: ModuleGlobals) => (...args: any[]) => any) {
  return Object.assign(fn, { [IMPORT_FACTORY]: true });
}

function decodeFromSharedBuffer(
  sharedBuffer: ArrayBuffer,
  start: number,
  len: number
) {
  const decoder = new TextDecoder();
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

  return decoder.decode(tempBuffer);
}

const imports = ((src: Record<string, Record<string, any>>) => {
  return function (g: ModuleGlobals) {
    const result = {} as any;
    for (const [module, fns] of Object.entries(src)) {
      result[module] = {};
      for (const [fn, imp] of Object.entries(fns)) {
        if (imp instanceof Function && imp[IMPORT_FACTORY]) {
          result[module][fn] = imp(g);
        } else {
          result[module][fn] = imp;
        }
      }
    }
    return result;
  };
})({
  js: {
    "__worker@create": importFactory((g) => (argPtr: number) => {
      console.log("create worker");
      const worker = new JobWorker({ name: "wasm:job" });
      worker.postMessage({
        type: "init",
        memory: g.memory,
        globalsPtr: argPtr,
      });
    }),
    "__console@log": importFactory((g) => (ptr: number, len: number) => {
      const str = decodeFromSharedBuffer(g.memory.buffer, ptr, len);
      console.log(str);
    }),
  },
});

export type WasmModuleExports = {
  __init_main(): void;
  __init_worker(globalsPtr: number): void;
};

export function createMemory() {
  const pageSize = 64 * 1024;
  const mibi = 1024 * 1024;
  const maxInBytes = 1024 * 4 * mibi;
  const maxInPages = Math.ceil(maxInBytes / pageSize);

  return new WebAssembly.Memory({
    initial: 256,
    maximum: maxInPages,
    shared: true,
  });
}

export async function createModule(memory?: WebAssembly.Memory) {
  if (!memory) {
    memory = createMemory();
  }

  const wasmModule = await createWasm({
    env: {
      memory,
    },
    ...imports({ memory }),
  });

  return {
    $memory: memory,
    ...wasmModule.exports,
  } as WasmModule;
}

export type WasmModule = {
  $memory: WebAssembly.Memory;
} & WasmModuleExports;
