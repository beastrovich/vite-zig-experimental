// import typescriptLogo from "./typescript.svg";
// import viteLogo from "/vite.svg";
// import blobWasm from "./blob.wasm?init";

import "./style.css";
import { scheduleRenderFrames } from "./render-scheduling";
import { Vector2 } from "./math";
import { Vector2Buffer } from "./data-buffers";
import {
  registerRenderLayerHook,
  RenderLayerContextInfo,
} from "./render-layer";
import SHADER from "./shaders.wgsl?raw";
import { Color, ColorF } from "./color";
import { getTruncatedText } from "./text-drawing";
import { WasmLib } from "./wasm";

// const lib = new WasmLib();

const lib = await WasmLib.create();

registerRenderLayerHook("main", (layer) => {
  const ci = layer.setupContext("2d");

  const fb = lib.createFrameBuffer(ci.width, ci.height);

  if (!fb) {
    throw new Error("Failed to create frame buffer");
  }

  let imgData = new ImageData(ci.width, ci.height);

  let frameCounter = 0;

  const rs = scheduleRenderFrames({
    frame: (t, d) => {
      if (frameCounter === 0) {
        console.log("fps", 1000 / d);
      }

      lib.renderToBuffer(fb, d);
      const view = lib.getBufferData(fb);

      imgData.data.set(view);
      // const imgBit = createImageBitmap()

      ci.context.putImageData(imgData, 0, 0);

      frameCounter += 1;
      frameCounter %= 60;
    },
    startImmediately: true,
  });

  layer.subscribe("resized", () => {
    lib.resizeFrameBuffer(fb, ci.width, ci.height);
    imgData = new ImageData(ci.width, ci.height);
  });

  // rs.start();
});

// const COUNT = 1;
// const PARTICLE_SIZE = 20;

// // Pre-allocated workspace
// const workspace = {
//   vec2A: new Vector2(),
//   vec2B: new Vector2(),
//   vec2C: new Vector2(),
//   vec2D: new Vector2(),
//   vec2E: new Vector2(),
//   positions: new Float32Array(COUNT * 2),
//   velocities: new Float32Array(COUNT * 2),
// };

// class ParticleRenderer {
//   private context: GPUCanvasContext;
//   private pipeline: GPURenderPipeline;
//   private positionBuffer: GPUBuffer;
//   private velocityBuffer: GPUBuffer;
//   private uniformBuffer: GPUBuffer;
//   private uniformBindGroup: GPUBindGroup;

//   constructor(
//     private layer: RenderLayerContextInfo<"webgpu">,
//     private device: GPUDevice
//   ) {
//     this.context = layer.context;

//     // Configure the context
//     const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
//     this.context.configure({
//       device: this.device,
//       format: canvasFormat,
//       alphaMode: "premultiplied",
//     });

//     // Create buffers
//     this.positionBuffer = this.device.createBuffer({
//       size: COUNT * 2 * 4,
//       usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
//     });

//     this.velocityBuffer = this.device.createBuffer({
//       size: COUNT * 2 * 4,
//       usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
//     });

//     // Update uniform buffer size to ensure proper alignment
//     const uniformBufferSize = 32; // Minimum size for uniform buffer
//     this.uniformBuffer = this.device.createBuffer({
//       size: uniformBufferSize,
//       usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
//     });

//     // Create pipeline
//     const shaderModule = this.device.createShaderModule({
//       code: SHADER,
//     });

//     this.pipeline = this.device.createRenderPipeline({
//       layout: "auto",
//       vertex: {
//         module: shaderModule,
//         entryPoint: "vertex_main",
//         buffers: [
//           {
//             arrayStride: 8,
//             stepMode: "instance", // Use instancing for particles
//             attributes: [
//               {
//                 shaderLocation: 0,
//                 offset: 0,
//                 format: "float32x2",
//               },
//             ],
//           },
//           {
//             arrayStride: 8,
//             stepMode: "instance", // Use instancing for particles
//             attributes: [
//               {
//                 shaderLocation: 1,
//                 offset: 0,
//                 format: "float32x2",
//               },
//             ],
//           },
//         ],
//       },
//       fragment: {
//         module: shaderModule,
//         entryPoint: "fragment_main",
//         targets: [
//           {
//             format: navigator.gpu.getPreferredCanvasFormat(),
//             blend: {
//               color: {
//                 srcFactor: "src-alpha",
//                 dstFactor: "one-minus-src-alpha",
//               },
//               alpha: {
//                 srcFactor: "src-alpha",
//                 dstFactor: "one-minus-src-alpha",
//               },
//             },
//           },
//         ],
//       },
//       primitive: {
//         topology: "triangle-list",
//       },
//     });

//     // Create bind group
//     this.uniformBindGroup = this.device.createBindGroup({
//       layout: this.pipeline.getBindGroupLayout(0),
//       entries: [
//         {
//           binding: 0,
//           resource: {
//             buffer: this.uniformBuffer,
//           },
//         },
//       ],
//     });
//   }

//   updateBuffers(posBuffer: Vector2Buffer, velBuffer: Vector2Buffer): void {
//     this.device.queue.writeBuffer(
//       this.positionBuffer,
//       0,
//       posBuffer.buffer,
//       posBuffer.data.byteOffset,
//       posBuffer.length * 8
//     );

//     this.device.queue.writeBuffer(
//       this.velocityBuffer,
//       0,
//       velBuffer.buffer,
//       velBuffer.data.byteOffset,
//       velBuffer.length * 8
//     );
//   }

//   render(): void {
//     const width = this.layer.width; // * dpr;
//     const height = this.layer.height; // * dpr;

//     // Update uniform buffer
//     const uniforms = new Float32Array([
//       width,
//       height, // viewport
//       PARTICLE_SIZE, // particleSize
//     ]);

//     this.device.queue.writeBuffer(this.uniformBuffer, 0, uniforms);

//     // Begin render pass
//     const commandEncoder = this.device.createCommandEncoder();
//     const textureView = this.context.getCurrentTexture().createView();

//     const renderPass = commandEncoder.beginRenderPass({
//       colorAttachments: [
//         {
//           view: textureView,
//           clearValue: { r: 0, g: 0, b: 0, a: 0 },
//           loadOp: "clear",
//           storeOp: "store",
//         },
//       ],
//     });

//     renderPass.setPipeline(this.pipeline);
//     renderPass.setBindGroup(0, this.uniformBindGroup);
//     renderPass.setVertexBuffer(0, this.positionBuffer);
//     renderPass.setVertexBuffer(1, this.velocityBuffer);
//     renderPass.draw(6, COUNT); // 6 vertices per quad, COUNT instances
//     // renderPass.draw(COUNT);
//     renderPass.end();

//     this.device.queue.submit([commandEncoder.finish()]);
//   }

//   cleanup(): void {
//     this.positionBuffer.destroy();
//     this.velocityBuffer.destroy();
//     this.uniformBuffer.destroy();
//   }
// }

// // Initialize particle system
// const prevPosBuffer = new Vector2Buffer(COUNT);
// const posBuffer = new Vector2Buffer(COUNT);
// const velocityBuffer = new Vector2Buffer(COUNT);

// {
//   // Initialize particles with workspace vectors
//   const spawnScaleFactor = 0.5;
//   const marginedWidth = 100 * spawnScaleFactor - PARTICLE_SIZE;
//   const marginedHeight = 100 * spawnScaleFactor - PARTICLE_SIZE;
//   const zero = new Vector2();

//   for (let i = 0; i < COUNT; i++) {
//     workspace.vec2A.set(
//       Math.random() * marginedWidth - marginedWidth / 2,
//       Math.random() * marginedHeight - marginedHeight / 2
//     );

//     const angle = Math.random() * Math.PI * 2;
//     workspace.vec2B.set(Math.cos(angle) * 0.1, Math.sin(angle) * 0.1);

//     posBuffer.push(workspace.vec2A);
//     prevPosBuffer.push(workspace.vec2A);
//     velocityBuffer.push(zero);
//   }
// }

// // Physics simulation
// // const repulsionFn = inverseRepulsion(0.001);

// // const forceBuffer = new Vector2Buffer(COUNT);
// // const posDeltaBuffer = new Vector2Buffer(COUNT);

// function animate(time: number, delta: number): void {
//   const deltaSeconds = delta / 1000;

//   {
//     const selfPos = new Vector2();
//     const prevSelfPos = new Vector2();
//     const neighborPos = new Vector2();
//     const selfToNeighbor = new Vector2();
//     const vel = new Vector2();

//     const deflectRange = PARTICLE_SIZE / 2;
//     const grav = new Vector2(0, -1000);

//     const bound = 400;

//     for (let i = 0; i < COUNT; i++) {
//       prevPosBuffer.read(i, prevSelfPos);
//       posBuffer.read(i, selfPos);

//       prevPosBuffer.write(i, selfPos);

//       vel.set(selfPos.x - prevSelfPos.x, selfPos.y - prevSelfPos.y);

//       // apply gravity
//       const x = new Vector2();
//       grav.copyTo(x);
//       x.scaleSelf(deltaSeconds ** 2);

//       selfPos.addSelf(vel);
//       selfPos.addSelf(x);

//       // for (let j = 0; j < COUNT; j++) {
//       //   if (i === j) {
//       //     continue;
//       //   }

//       //   posBuffer.read(j, neighborPos);

//       //   selfToNeighbor.set(
//       //     neighborPos.x - selfPos.x,
//       //     neighborPos.y - selfPos.y
//       //   );

//       //   const dist = selfToNeighbor.length();
//       //   const diff = 2 * deflectRange - dist;

//       //   selfToNeighbor.normalizeSelf();

//       //   if (diff > 0) {
//       //     const scale = -diff / 2;
//       //     selfPos.x += selfToNeighbor.x * scale;
//       //     selfPos.y += selfToNeighbor.y * scale;
//       //   }

//       //   // vectorItoJ.normalizeSelf();
//       // }

//       // Enforce boundaries

//       // const hardMargin = PARTICLE_SIZE / 2;
//       const dist = selfPos.length();

//       if (selfPos.y < -bound) {
//         selfPos.y = -bound;
//       }

//       if (selfPos.x < -bound) {
//         selfPos.x = -bound;
//       }
//       // if (selfPos.x < box.left + hardMargin) {
//       //   selfPos.x = box.left + hardMargin;
//       //   // vel.x = Math.abs(vel.x);
//       // } else if (selfPos.x > box.right - hardMargin) {
//       //   selfPos.x = box.right - hardMargin;
//       //   // vel.x = -Math.abs(vel.x);
//       // }

//       // if (selfPos.y < box.top + hardMargin) {
//       //   selfPos.y = box.top + hardMargin;
//       //   // vel.y = Math.abs(vel.y);
//       // } else if (selfPos.y > box.bottom - hardMargin) {
//       //   selfPos.y = box.bottom - hardMargin;
//       //   // vel.y = -Math.abs(vel.y);
//       // }

//       // velocityBuffer.write(i, vel);
//       posBuffer.write(i, selfPos);
//     }
//   }
// }

// // Main rendering setup
// // let mainView: RenderLayer;

// const init = (() => {
//   let adapter: GPUAdapter | null = null;
//   let device: GPUDevice | null = null;

//   return async () => {
//     if (!navigator.gpu) {
//       throw Error("WebGPU not supported.");
//     }

//     if (!adapter) {
//       adapter = await navigator.gpu.requestAdapter();
//       if (!adapter) {
//         throw Error("Couldn't request WebGPU adapter.");
//       }

//       device = await adapter.requestDevice();
//     }

//     return { adapter, device: device! };
//   };
// })();

// // const { adapter, device } = await init();

// // registerRenderLayerHook("main", (layer) => {
// //   // mainView = layer;

// //   const li = layer.setupContext("webgpu");
// //   // const particleLayer = viewport.createLayer("webgpu", 0, (l) => {});
// //   // const backLayer = viewport.createLayer("2d", 1);

// //   const particleRenderer = new ParticleRenderer(li, device);

// //   const frameScheduler = scheduleRenderFrames({
// //     frame: (t, d) => {
// //       const substeps = 8;
// //       const subDelta = d / substeps;
// //       for (let i = 0; i < substeps; i++) {
// //         animate(t, subDelta);
// //         t += subDelta;
// //       }
// //       particleRenderer.updateBuffers(posBuffer, velocityBuffer);
// //       particleRenderer.render();
// //     },
// //     startImmediately: false,
// //   });

// //   frameScheduler.start();

// //   return () => {
// //     frameScheduler.stop();
// //     particleRenderer.cleanup();
// //   };
// // });

// registerRenderLayerHook("helper", (layer) => {
//   let imageData: ImageData | null = null;

//   function shadePixels(
//     ctx: CanvasRenderingContext2D,
//     xUnit: number,
//     yUnit: number,
//     relativeOrigin: Vector2,
//     upVector: Vector2,
//     shader: (pos: Vector2, outColor: Color) => void
//   ) {
//     if (
//       !imageData ||
//       imageData.width !== ctx.canvas.width ||
//       imageData.height !== ctx.canvas.height
//     ) {
//       imageData = new ImageData(ctx.canvas.width, ctx.canvas.height);
//     }

//     const data = imageData.data;
//     const width = ctx.canvas.width;
//     const height = ctx.canvas.height;

//     const origin = new Vector2();
//     const pos = new Vector2();
//     const color = ColorF.create();

//     origin.set(relativeOrigin.x * width, relativeOrigin.y * height);

//     for (let y = 0; y < height; y++) {
//       for (let x = 0; x < width; x++) {
//         pos.set(
//           (x - origin.x) * xUnit * upVector.x,
//           (y - origin.y) * yUnit * upVector.y
//         );

//         shader(pos, color);

//         const idx = (y * width + x) * 4;
//         data[idx] = color[0] * 255;
//         data[idx + 1] = color[1] * 255;
//         data[idx + 2] = color[2] * 255;
//         data[idx + 3] = color[3] * 255;
//       }
//     }

//     ctx.putImageData(imageData, 0, 0);
//   }

//   const update = ({ context, width, height }: RenderLayerContextInfo<"2d">) => {
//     context.clearRect(0, 0, width, height);

//     const sinkRange = 100;
//     const totalPullRange = 200;
//     const epsilon = 0.00000001;
//     shadePixels(
//       context,
//       1,
//       1,
//       new Vector2(0.5, 0.5),
//       new Vector2(1, -1),
//       (pos, outColor) => {
//         const dist = pos.length();

//         if (Math.abs(sinkRange - dist) < epsilon) {
//           ColorF.set(outColor, 0, 0, 0, 1);
//           return;
//         } else if (dist < sinkRange) {
//           const n = dist / sinkRange;
//           const force = n;
//           // const force = dist / sinkRange;
//           const colorChannel = Math.log2(force + 1);
//           ColorF.set(outColor, 0, 0, colorChannel, 1);
//           return;
//         } else {
//           const n = (totalPullRange - dist) / (totalPullRange - sinkRange);
//           const force = n;
//           // const force = 1 / (dist - sinkRange);
//           const colorChannel = Math.log2(force + 1);
//           ColorF.set(outColor, 0, 0, colorChannel, 1);
//           return;
//         }
//       }
//     );

//     if (isPointerOver) {
//       context.fillStyle = "red";
//       context.beginPath();
//       // console.log(pointerPos);
//       context.ellipse(pointerPos.x, pointerPos.y, 10, 10, 0, 0, Math.PI * 2);
//       context.fill();
//     }
//   };

//   const ci = layer.setupContext("2d", { willReadFrequently: true });

//   const frameScheduler = scheduleRenderFrames({
//     frame: (t, d) => {
//       update(ci);
//     },
//     startImmediately: false,
//   });

//   let isPointerOver = false;
//   let pointerPos = new Vector2();

//   layer.subscribe("resized", () => {
//     imageData = null;
//     update(ci);
//   });

//   layer.subscribe("pointermove", (x, y) => {
//     pointerPos.set(x, y);
//   });

//   layer.subscribe("pointerenter", () => {
//     isPointerOver = true;
//   });

//   layer.subscribe("pointerleave", () => {
//     isPointerOver = false;
//   });

//   frameScheduler.start();

//   return () => {
//     frameScheduler.stop();
//   };
// });

// function drawAreaChart(
//   ctx: CanvasRenderingContext2D,
//   data: number[],
//   maxValue: number,
//   x: number,
//   y: number,
//   width: number,
//   height: number
// ) {
//   if (data.length === 0) {
//     return;
//   }

//   const barWidth = width / data.length;
//   const scale = height / maxValue;

//   const pathData = new Path2D();
//   pathData.moveTo(x, y + height);

//   for (let i = 0; i < data.length; i++) {
//     let barHeight = data[i] * scale;
//     if (barHeight > height) {
//       barHeight = height;
//     }
//     pathData.lineTo(x + i * barWidth, y + height - barHeight);
//   }

//   pathData.lineTo(x + width, y + height);
//   pathData.closePath();

//   ctx.fill(pathData);
// }

// const randomData = Array.from({ length: 100 }, () => Math.random() * 100);

// registerRenderLayerHook("footer", (layer) => {
//   layer.host.style.height = "100px";

//   const ci = layer.setupContext("2d");

//   const txt = "Hello, world!";
//   const size = 30;
//   ci.context.font = `${size}px monospace`;
//   const labelText = getTruncatedText(ci.context, txt, 200);
//   ci.context.beginPath();
//   // ci.context.m;

//   const update = () => {
//     const { context } = ci;

//     context.fillStyle = "black";
//     context.fillRect(0, 0, ci.width, ci.height);

//     const posX = 0;
//     const posY = 0;
//     // const cssSize =  + "px";

//     context.strokeStyle = "red";
//     context.strokeRect(
//       posX,
//       posY,
//       labelText.metrics.width,
//       labelText.metrics.height
//     );

//     context.fillStyle = "white";
//     context.font = `${size}px monospace`;
//     context.fillText(labelText.text, posX, posY + labelText.metrics.baseline);

//     drawAreaChart(context, randomData, 200, 0, 0, ci.width, 100);
//   };

//   layer.subscribe("resized", update);

//   update();
// });
