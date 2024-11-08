type RenderContextTypeMap = {
  "2d": {
    ctx: CanvasRenderingContext2D;
    opt: CanvasRenderingContext2DSettings;
  };
  webgl: {
    ctx: WebGLRenderingContext;
    opt: WebGLContextAttributes;
  };
  webgl2: {
    ctx: WebGL2RenderingContext;
    opt: WebGLContextAttributes;
  };
  webgpu: {
    ctx: GPUCanvasContext;
    opt: GPURequestAdapterOptions;
  };
  bitmaprenderer: {
    ctx: ImageBitmapRenderingContext;
    opt: ImageBitmapRenderingContextSettings;
  };
};

export type RenderContext =
  RenderContextTypeMap[keyof RenderContextTypeMap]["ctx"];

export namespace RenderContext {
  export type FromContextType<CT extends ContextType> =
    RenderContextTypeMap[CT]["ctx"];
}

export type RenderContextOptions =
  RenderContextTypeMap[keyof RenderContextTypeMap]["opt"];

export namespace RenderContextOptions {
  export type FromContextType<CT extends ContextType> =
    RenderContextTypeMap[CT]["opt"];
}

export type ContextType = keyof RenderContextTypeMap;

export interface RenderLayerContextInfo<CT extends ContextType> {
  // canvas: HTMLCanvasElement;
  context: RenderContextTypeMap[CT]["ctx"];
  options: RenderContextTypeMap[CT]["opt"];
  type: CT;
  width: number;
  height: number;
  dpr: number;
}

export type RenderLayerUpdate<CT extends ContextType> = (
  layerInfo: RenderLayerContextInfo<CT>
) => void;

export type RenderLayerEventMap = {
  resized: [];
  pointermove: [x: number, y: number];
  pointerdown: [x: number, y: number];
  pointerup: [x: number, y: number];
  pointerenter: [];
  pointerleave: [];
};

export type UnsubscribeFn = () => void;

export type RenderLayer = {
  readonly name: string | null;
  readonly host: HTMLElement;

  setupContext<CT extends ContextType>(
    type: CT,
    options?: RenderContextTypeMap[CT]["opt"]
  ): RenderLayerContextInfo<CT>;

  subscribe<K extends keyof RenderLayerEventMap>(
    event: K,
    callback: (...args: RenderLayerEventMap[K]) => void
  ): UnsubscribeFn;
};

export type RenderLayerCleanupFn = () => void;
export type RenderLayerHook = (
  layer: RenderLayer
) => RenderLayerCleanupFn | void;

export const noop = () => {};
