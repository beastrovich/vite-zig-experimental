import { createModule } from "./wasm-module";

export type MessageType = {
  type: "init";
  memory: WebAssembly.Memory;
  globalsPtr: number;
};

async function init(memory: WebAssembly.Memory, globalsPtr: number) {
  const wasm = await createModule(memory);
  wasm.__init_worker(globalsPtr);
}

const msgHandler = ({ data }: MessageEvent<MessageType>) => {
  switch (data.type) {
    case "init":
      console.log("job-worker:init");
      init(data.memory, data.globalsPtr);
      break;
  }
};

self.onmessage = msgHandler;
