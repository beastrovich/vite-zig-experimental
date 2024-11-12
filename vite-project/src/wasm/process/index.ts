import { createMemory } from "./core";
import { ProcessHostMessageType } from "./host-messages";
import { startMainThread, startWorkerThread } from "./thread";

export class Process {
  #memory: WebAssembly.Memory;

  constructor() {
    console.log("Process constructor");

    this.#memory = createMemory();
    this.#runMain();
  }

  #runMain() {
    this.#onThreadStart(startMainThread(this.#memory));
  }

  #onThreadStart(worker: Worker) {
    worker.addEventListener("message", this.#handleWorkerMessage);
  }

  #handleWorkerMessage = (event: MessageEvent<ProcessHostMessageType>) => {
    switch (event.data.type) {
      case "worker:start": {
        const { dataPtr, globalContextPtr, startFnPtr, idx } = event.data;
        startWorkerThread(
          this.#memory,
          globalContextPtr,
          startFnPtr,
          dataPtr,
          idx
        );
        break;
      }
      default: {
        console.error("Unknown worker message", event.data);
      }
    }
  };
}
