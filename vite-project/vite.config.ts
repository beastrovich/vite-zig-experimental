import type { UserConfig } from "vite";
import * as Path from "path";
import { watch } from "fs/promises";

// import Bun from "bun";
// Bun.

import Choki from "chokidar";

const srcWasmPath = Path.join(import.meta.dir, "src", "wasm", "wasm.wasm");

let foo = 1;
export default {
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  plugins: [
    {
      name: "wasm",

      configureServer(serv) {
        // custom watching using polling
        // because changes to wasm files are not detected
        // otherwise
        const watcher = Choki.watch(srcWasmPath, {
          usePolling: true,
        });

        watcher.on("change", (ev) => {
          console.log(ev);
          serv.ws.send({
            type: "full-reload",
          });
        });
      },
    },
  ],
} satisfies UserConfig;
// /home/beastrovich/repos/labs/vite-zig/vite-project/src/wasm/blob.wasm
