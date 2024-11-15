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
        const { ptr } = event.data;
        this.#onThreadStart(startWorkerThread(this.#memory, ptr));
        break;
      }
      case "worker:closed": {
        console.log("Worker thread closed");
        break;
      }
      case "main:closed": {
        console.log("Main thread closed");
        break;
      }
      default: {
        console.error("Unknown worker message", event.data);
      }
    }
  };
}
