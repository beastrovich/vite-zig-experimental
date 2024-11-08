import { ArraySetMap } from "../array-set-map";
import { RenderLayer, RenderLayerCleanupFn, RenderLayerHook } from "./common";

const layers = new Set<RenderLayer>();
const layersNameIndex = new Map<string, RenderLayer>();
const hooks = new ArraySetMap<string, RenderLayerHook>();
const cleanups = new ArraySetMap<string, RenderLayerCleanupFn>();

function executeNamedHooks(layerName: string) {
  const handlers = hooks.get(layerName);
  const elem = layersNameIndex.get(layerName);
  if (!elem) return;

  const cleanupFns = handlers
    .map((handler) => handler(elem))
    .filter((x) => x !== undefined);

  cleanups.addMany(layerName, cleanupFns);
}

function cleanupNamedHooks(layerName: string) {
  cleanups.get(layerName).forEach((fn) => fn());
  cleanups.delete(layerName);
}

export function registerRenderLayerHook(
  layerName: string,
  hook: RenderLayerHook
): () => void {
  let disposed = false;

  hooks.add(layerName, hook);

  const cleanup = () => {
    if (disposed) return;
    disposed = true;

    hooks.delete(layerName, hook);
  };

  executeNamedHooks(layerName);
  return cleanup;
}

export function layerMounted(layer: RenderLayer, name: string | null) {
  layers.add(layer);

  if (name === null) return;

  if (layersNameIndex.has(name)) {
    throw new Error(`Layer with name "${name}" already exists`);
  }

  layersNameIndex.set(name, layer);
  executeNamedHooks(name);
}

export function layerUnmounted(layer: RenderLayer, name: string | null) {
  layers.delete(layer);

  if (name === null) return;

  cleanupNamedHooks(name);
  layersNameIndex.delete(name);
}

export function layerNameChanged(
  elem: RenderLayer,
  oldValue: string | null,
  newValue: string | null
) {
  if (!layers.has(elem)) return;

  if (oldValue !== null) {
    cleanupNamedHooks(oldValue);
    layersNameIndex.delete(oldValue);
  }

  if (newValue !== null && layersNameIndex.has(newValue)) {
    throw new Error(`Layer with name "${newValue}" already exists`);
  }

  if (newValue === null) return;

  layersNameIndex.set(newValue, elem);

  executeNamedHooks(newValue);
}
