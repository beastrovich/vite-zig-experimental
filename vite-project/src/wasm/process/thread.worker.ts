import { createModule } from "./core";
import { createImports } from "./interop";

export type MessageType =
  | {
      type: "init:worker";
      memory: WebAssembly.Memory;
      globalContextPtr: number;
      startFnPtr: number;
      dataPtr: number;
      idx: number;
    }
  | {
      type: "init:main";
      memory: WebAssembly.Memory;
    };

async function initMain(memory: WebAssembly.Memory) {
  const imports = createImports(memory);
  const wasm = await createModule(memory, imports);
  wasm.exports.__wasm_mainStart();
}

async function initWorker(
  memory: WebAssembly.Memory,
  globalsPtr: number,
  startFnPtr: number,
  dataPtr: number,
  idx: number
) {
  const imports = createImports(memory);
  const wasm = await createModule(memory, imports);
  console.log("web-worker: initWorker", globalsPtr, startFnPtr, dataPtr, idx);
  wasm.exports.__wasm_workerStart(globalsPtr, startFnPtr, dataPtr, idx);
}

self.addEventListener("message", ({ data }: MessageEvent<MessageType>) => {
  switch (data.type) {
    case "init:main": {
      initMain(data.memory);
      break;
    }
    case "init:worker": {
      initWorker(
        data.memory,
        data.globalContextPtr,
        data.startFnPtr,
        data.dataPtr,
        data.idx
      );
      break;
    }
  }
});
