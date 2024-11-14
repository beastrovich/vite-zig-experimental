import { createModule } from "./core";
import { createImports } from "./interop";

export type MessageType =
  | {
      type: "init:worker";
      memory: WebAssembly.Memory;
      globalContextPtr: number;
      instancePtr: number;
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
  instancePtr: number
) {
  const imports = createImports(memory);
  const wasm = await createModule(memory, imports);
  console.log("web-worker: initWorker", globalsPtr, instancePtr);
  wasm.exports.__threadStartCallback(globalsPtr, instancePtr);
}

self.addEventListener("message", ({ data }: MessageEvent<MessageType>) => {
  switch (data.type) {
    case "init:main": {
      initMain(data.memory);
      break;
    }
    case "init:worker": {
      initWorker(data.memory, data.globalContextPtr, data.instancePtr);
      break;
    }
  }
});
