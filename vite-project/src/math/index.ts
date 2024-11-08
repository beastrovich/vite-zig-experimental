// path: @/math/index.ts

export { Vector2 } from "./vector2";
export { Vector3 } from "./vector3";
export { Matrix3x3 } from "./matrix3x3";
export { Matrix4x4 } from "./matrix4x4";

export function radiansToDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}

export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
