// path: @/render-viewport.ts

import {
  ContextType,
  RenderContextOptions,
  RenderLayer,
  RenderLayerContextInfo,
  RenderLayerEventMap,
  UnsubscribeFn,
} from "./common";
import { layerMounted, layerNameChanged, layerUnmounted } from "./registry";

const viewportResizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const viewport = entry.target as RenderLayerElement;
    viewport.onResized();
  }
});

const emptyArray = [] as const;

type RenderLayerEventCallbackStore = {
  [K in keyof RenderLayerEventMap]: readonly ((
    ...args: RenderLayerEventMap[K]
  ) => void)[];
};

type ElementCallbacks = {
  pointermove: (this: Element, ev: PointerEvent) => void;
  pointerdown: (this: Element, ev: PointerEvent) => void;
  pointerup: (this: Element, ev: PointerEvent) => void;
  pointerenter: (this: Element, ev: PointerEvent) => void;
  pointerleave: (this: Element, ev: PointerEvent) => void;
};

class Layer implements RenderLayer {
  constructor(private readonly _host: RenderLayerElement) {}

  get name() {
    return this._host.name;
  }

  get host() {
    return this._host;
  }

  setupContext<CT extends ContextType>(
    type: CT,
    options?: RenderContextOptions.FromContextType<CT>
  ): RenderLayerContextInfo<CT> {
    return this._host.setupContext(type, options);
  }

  subscribe<K extends keyof RenderLayerEventMap>(
    event: K,
    callback: (...args: RenderLayerEventMap[K]) => void
  ): UnsubscribeFn {
    return this._host.subscribe(event, callback);
  }
}

export class RenderLayerElement extends HTMLElement {
  // private _style: HTMLStyleElement;

  static observedAttributes = ["name"];

  private _shadow: ShadowRoot;

  private _contextInfo: RenderLayerContextInfo<any> | null;
  private _canvas: HTMLCanvasElement | null;

  private _eventCallbacks: RenderLayerEventCallbackStore;
  private _elementCallbacks: ElementCallbacks;

  private _layer: RenderLayer;

  constructor() {
    super();

    this._layer = new Layer(this);

    this._shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
          :host {
              display: block;
              position: relative;
              overflow: hidden;
          }

          canvas {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
          }
      `;

    this._shadow.appendChild(style);

    this._contextInfo = null;
    this._eventCallbacks = {
      resized: emptyArray,
      pointermove: emptyArray,
      pointerdown: emptyArray,
      pointerup: emptyArray,
      pointerenter: emptyArray,
      pointerleave: emptyArray,
    };

    this._elementCallbacks = {
      pointermove: this.onPointerMove.bind(this),
      pointerdown: this.onPointerDown.bind(this),
      pointerup: this.onPointerUp.bind(this),
      pointerenter: this.onPointerEnter.bind(this),
      pointerleave: this.onPointerLeave.bind(this),
    };

    this._canvas = null;
  }

  connectedCallback() {
    viewportResizeObserver.observe(this, { box: "device-pixel-content-box" });

    layerMounted(this._layer, this.name);
  }

  disconnectedCallback() {
    viewportResizeObserver.unobserve(this);

    layerUnmounted(this._layer, this.name);
  }

  onResized() {
    if (!this._contextInfo) return;
    this.setCanvasSize(this._contextInfo);
    for (const callback of this._eventCallbacks.resized) {
      callback();
    }
  }

  private setCanvasSize(ci: RenderLayerContextInfo<any>) {
    const dpr = window.devicePixelRatio;
    const width = this.offsetWidth;
    const height = this.offsetHeight;

    ci.width = width * dpr;
    ci.height = height * dpr;

    this._canvas!.width = ci.width;
    this._canvas!.height = ci.height;

    ci.dpr = dpr;
  }

  private ensureCanvas(contextType: ContextType, options: any) {
    if (
      this._contextInfo?.type === contextType &&
      this._contextInfo?.options === options
    )
      return;

    this.destroyCanvas();

    const canvas = document.createElement("canvas");
    const ci: RenderLayerContextInfo<any> = {
      options,
      type: contextType,
      context: null!,
      width: 0,
      height: 0,
      dpr: 1,
    };

    this._contextInfo = ci;
    this._canvas = canvas;

    this._shadow.appendChild(canvas);

    ci.context = canvas.getContext(contextType, options) as any;

    this.setCanvasSize(ci);
  }

  private destroyCanvas() {
    if (!this._contextInfo) return;

    this._canvas!.remove();
    this._contextInfo = null;
  }

  setupContext<CT extends ContextType>(type: CT, options: any) {
    this.ensureCanvas(type, options);
    return this._contextInfo!;
  }

  get name() {
    return this.getAttribute("name");
  }

  set name(value: string | null) {
    if (value) {
      this.setAttribute("name", value);
    } else {
      this.removeAttribute("name");
    }
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (name === "name") {
      this.onAttributeChanged_viewId(oldValue, newValue);
    }
  }

  onAttributeChanged_viewId(oldValue: string | null, newValue: string | null) {
    layerNameChanged(this._layer, oldValue, newValue);
  }

  private onPointerMove(ev: PointerEvent) {
    for (const callback of this._eventCallbacks.pointermove) {
      callback(
        ev.offsetX * window.devicePixelRatio,
        ev.offsetY * window.devicePixelRatio
      );
    }
  }

  private onPointerDown(ev: PointerEvent) {
    for (const callback of this._eventCallbacks.pointerdown) {
      callback(
        ev.offsetX * window.devicePixelRatio,
        ev.offsetY * window.devicePixelRatio
      );
    }
  }

  private onPointerUp(ev: PointerEvent) {
    for (const callback of this._eventCallbacks.pointerup) {
      callback(
        ev.offsetX * window.devicePixelRatio,
        ev.offsetY * window.devicePixelRatio
      );
    }
  }

  private onPointerEnter(ev: PointerEvent) {
    for (const callback of this._eventCallbacks.pointerenter) {
      callback();
    }
  }

  private onPointerLeave(ev: PointerEvent) {
    for (const callback of this._eventCallbacks.pointerleave) {
      callback();
    }
  }

  private onFirstSubscription(event: keyof RenderLayerEventMap) {
    switch (event) {
      case "pointermove":
      case "pointerdown":
      case "pointerup":
      case "pointerenter":
      case "pointerleave":
        this.addEventListener(event, this._elementCallbacks[event]);
        break;
    }
  }

  private onLastUnsubscription(event: keyof RenderLayerEventMap) {
    switch (event) {
      case "pointermove":
      case "pointerdown":
      case "pointerup":
      case "pointerenter":
      case "pointerleave":
        this.removeEventListener(event, this._elementCallbacks[event]);
        break;
    }
  }

  subscribe<K extends keyof RenderLayerEventMap>(
    event: K,
    callback: (...args: RenderLayerEventMap[K]) => void
  ): UnsubscribeFn {
    let unsubscribed = false;
    this._eventCallbacks[event] = [
      ...this._eventCallbacks[event],
      callback,
    ] as any;
    if (this._eventCallbacks[event].length === 1) {
      this.onFirstSubscription(event);
    }

    return () => {
      if (unsubscribed) return;
      this._eventCallbacks[event] = this._eventCallbacks[event].filter(
        (cb) => cb !== callback
      ) as any;
      if (this._eventCallbacks[event].length === 0) {
        this.onLastUnsubscription(event);
      }
      unsubscribed = true;
    };
  }
}

customElements.define("render-layer", RenderLayerElement);
