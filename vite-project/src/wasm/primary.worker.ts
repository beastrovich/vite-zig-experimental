import { createModule } from "./wasm-module";

export type MessageType = {
  type: "init";
  memory: WebAssembly.Memory;
};

async function init(memory: WebAssembly.Memory) {
  const wasm = await createModule(memory);
  wasm.__init_main();
}

const msgHandler = ({ data }: MessageEvent<MessageType>) => {
  switch (data.type) {
    case "init":
      console.log("init");
      init(data.memory);
      break;
  }
};

self.onmessage = msgHandler;
