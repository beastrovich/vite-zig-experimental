import type { UserConfig } from "vite";
import * as Path from "path";
import { watch } from "fs/promises";

// import Bun from "bun";
// Bun.
console.log(import.meta);

import Choki from "chokidar";

const srcWasmPath = Path.join(
  import.meta.dirname,
  "src",
  "wasm",
  "process",
  "wasm.wasm"
);

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
