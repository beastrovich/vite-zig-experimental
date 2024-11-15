import { ModuleImports } from "./core";

const decoder = new TextDecoder();

function decodeText(buffer: ArrayBuffer, start: number, len: number) {
  const copyLength = Math.min(buffer.byteLength, len);

  // Create a temporary ArrayBuffer and copy the contents of the shared buffer
  // into it.
  const tempBuffer = new ArrayBuffer(copyLength);
  const tempView = new Uint8Array(tempBuffer);

  let sharedView = new Uint8Array(buffer);

  if (buffer.byteLength != copyLength) {
    sharedView = sharedView.subarray(start, start + copyLength);
  }
  tempView.set(sharedView);

  return decoder.decode(tempBuffer);
}

export function createImports(memory: WebAssembly.Memory): ModuleImports {
  return {
    console: {
      log(ptr, len) {
        console.log(decodeText(memory.buffer, ptr, len));
      },
    },
    sys: {
      cpuCount() {
        return navigator.hardwareConcurrency;
      },
    },
    web_worker: {
      start(ptr) {
        self.postMessage({
          type: "worker:start",
          ptr,
        });
      },
    },
  };
}
