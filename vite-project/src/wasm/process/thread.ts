import Worker from "./thread.worker?worker";
import type { MessageType } from "./thread.worker";

export function startMainThread(memory: WebAssembly.Memory) {
  const worker = new Worker();

  const initMsg: MessageType = {
    type: "init:main",
    memory,
  };

  worker.postMessage(initMsg);
  return worker;
}

export function startWorkerThread(memory: WebAssembly.Memory, ptr: number) {
  const worker = new Worker();

  const initMsg: MessageType = {
    type: "init:worker",
    memory,
    ptr,
  };

  worker.postMessage(initMsg);
  return worker;
}
