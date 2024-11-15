import { createModule } from "./core";
import { createImports } from "./interop";

export type MessageType =
  | {
      type: "init:worker";
      memory: WebAssembly.Memory;
      ptr: number;
    }
  | {
      type: "init:main";
      memory: WebAssembly.Memory;
    };

let isMain = false;

async function initMain(memory: WebAssembly.Memory) {
  isMain = true;
  const imports = createImports(memory);
  const wasm = await createModule(memory, imports);
  wasm.exports.__wasm_mainStart();
  close();
}

async function initWorker(memory: WebAssembly.Memory, ptr: number) {
  const imports = createImports(memory);
  const wasm = await createModule(memory, imports);
  console.log("web-worker: initWorker", ptr);
  wasm.exports.__wasm_threadStart(ptr);
  close();
}

function close() {
  if (isMain) {
    self.postMessage({ type: "main:closed" });
  } else {
    self.postMessage({ type: "worker:closed" });
  }
  self.close();
  console.log("web-worker: closed");
}

self.addEventListener("message", ({ data }: MessageEvent<MessageType>) => {
  switch (data.type) {
    case "init:main": {
      initMain(data.memory);
      break;
    }
    case "init:worker": {
      initWorker(data.memory, data.ptr);
      break;
    }
  }
});
