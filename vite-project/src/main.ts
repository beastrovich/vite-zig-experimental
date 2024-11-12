// import typescriptLogo from "./typescript.svg";
// import viteLogo from "/vite.svg";
// import blobWasm from "./blob.wasm?init";

import "./style.css";
import { scheduleRenderFrames } from "./render-scheduling";
import { registerRenderLayerHook } from "./render-layer";

import { Process } from "./wasm";

const proc = new Process();

registerRenderLayerHook("main", (layer) => {
  const ci = layer.setupContext("2d");

  let frameCounter = 0;

  let rendering = false;

  let imageData = new ImageData(Math.max(ci.width, 1), Math.max(ci.height, 1));

  async function renderAsync(delta: number) {
    if (rendering) {
      return;
    }
    if (ci.width === 0 || ci.height === 0) {
      return;
    }
    rendering = true;

    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = frameCounter & 0xff;
      imageData.data[i + 1] = 0;
      imageData.data[i + 2] = 0;
      imageData.data[i + 3] = 255;
    }

    // const bitmap = await createImageBitmap(imageData);
    ci.context.putImageData(imageData, 0, 0);

    console.log("FPS: ", 1000 / delta);
    frameCounter++;
    rendering = false;
  }

  // const rs = scheduleRenderFrames({
  //   frame: (t, d) => renderAsync(d),
  //   startImmediately: true,
  // });

  layer.subscribe("resized", () => {
    imageData = new ImageData(Math.max(ci.width, 1), Math.max(ci.height, 1));
  });

  // rs.start();
});
