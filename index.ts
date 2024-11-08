import { watch } from "fs/promises";

import { $ } from "bun";

const zigProjPath = Bun.fileURLToPath(new URL("./zig", import.meta.url));

let queuedRebuild = false;
let isRebuilding = false;

$.throws(false);

const runRebuild = async () => {
  isRebuilding = true;

  console.log("Rebuilding Zig project...");

  // try {

  const output = await $`
    cd ${zigProjPath}
    zig build
  `;
  // } catch (e) {
  // }

  let hadOutput = output.stdout.length > 0 || output.stderr.length > 0;

  const errBuff = new Uint8Array(output.stderr);
  const outBuff = new Uint8Array(output.stdout);

  process.stderr.write(errBuff);
  process.stdout.write(outBuff);

  if (!hadOutput) {
    console.log("Zig project is up to date");
  } else if (output.exitCode === 0) {
    console.log("Zig project rebuilt");
  } else {
    console.error("Zig build failed");
  }

  if (queuedRebuild) {
    queuedRebuild = false;
    setTimeout(runRebuild, 0);
  } else {
    isRebuilding = false;
  }
};

let debounceTimer: Timer | null = null;

console.log(zigProjPath);

function scheduleRebuild() {
  if (isRebuilding) {
    queuedRebuild = true;
    return;
  }

  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(runRebuild, 1000);
}

async function runWatcher() {
  scheduleRebuild();

  for await (const entry of watch(zigProjPath, { recursive: true })) {
    if (entry.filename?.endsWith(".zig")) {
      console.log(`File ${entry.filename} changed`);
      scheduleRebuild();
    }
  }
}

await runWatcher();
// console.log(done);
// process.stdout.write(done.bytes());
