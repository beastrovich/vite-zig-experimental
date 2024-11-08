import PrimaryWorker from "./primary.worker?worker";
import type { MessageType } from "./primary.worker";
import "./blob.wasm?init";
import { createMemory } from "./wasm-module";

export class WasmLib {
  readonly memory: WebAssembly.Memory;

  #worker: Worker;

  constructor() {
    const memory = createMemory();

    const worker = new PrimaryWorker({
      name: "wasm:primary",
    });

    worker.onmessage = (event) => {};

    this.memory = memory;
    this.#worker = worker;

    this.postMessage({
      type: "init",
      memory,
    });
  }

  postMessage(message: MessageType) {
    this.#worker.postMessage(message);
  }
}
