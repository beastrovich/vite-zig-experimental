// path: @/math/vector3.ts

import { Matrix4x4 } from "./matrix4x4";
import { Vector2 } from "./vector2";

/**
 * A mutable 3D vector implemented as a C-like structure.
 * All operations that return a Vector3 modify their output parameter.
 * Methods ending in 'Self' modify the vector instance itself.
 *
 * Note: This implementation prioritizes performance over safety.
 * - No parameter validation is performed
 * - No protection against division by zero
 */
export class Vector3 {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0
  ) {}

  set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  copyTo(out: Vector3): Vector3 {
    out.x = this.x;
    out.y = this.y;
    out.z = this.z;
    return out;
  }

  getXY(out: Vector2): Vector2 {
    out.x = this.x;
    out.y = this.y;
    return out;
  }

  getXZ(out: Vector2): Vector2 {
    out.x = this.x;
    out.y = this.z;
    return out;
  }

  getYZ(out: Vector2): Vector2 {
    out.x = this.y;
    out.y = this.z;
    return out;
  }

  setFromXY(v: Vector2): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  setFromXZ(v: Vector2): this {
    this.x = v.x;
    this.z = v.y;
    return this;
  }

  setFromYZ(v: Vector2): this {
    this.y = v.x;
    this.z = v.y;
    return this;
  }

  scale(s: number, out: Vector3): Vector3 {
    out.x = this.x * s;
    out.y = this.y * s;
    out.z = this.z * s;
    return out;
  }

  scaleSelf(s: number): this {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  matMul4x4(m: Matrix4x4, out: Vector3): Vector3 {
    out.x = m.m00 * this.x + m.m01 * this.y + m.m02 * this.z + m.m03;
    out.y = m.m10 * this.x + m.m11 * this.y + m.m12 * this.z + m.m13;
    out.z = m.m20 * this.x + m.m21 * this.y + m.m22 * this.z + m.m23;
    return out;
  }

  matMul4x4Self(m: Matrix4x4): this {
    const x = m.m00 * this.x + m.m01 * this.y + m.m02 * this.z + m.m03;
    const y = m.m10 * this.x + m.m11 * this.y + m.m12 * this.z + m.m13;
    const z = m.m20 * this.x + m.m21 * this.y + m.m22 * this.z + m.m23;
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  subtract(v: Vector3, out: Vector3): Vector3 {
    out.x = this.x - v.x;
    out.y = this.y - v.y;
    out.z = this.z - v.z;
    return out;
  }

  subtractSelf(v: Vector3): this {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  add(v: Vector3, out: Vector3): Vector3 {
    out.x = this.x + v.x;
    out.y = this.y + v.y;
    out.z = this.z + v.z;
    return out;
  }

  addSelf(v: Vector3): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  normalize(out: Vector3): Vector3 {
    const len = this.length();
    out.x = this.x / len;
    out.y = this.y / len;
    out.z = this.z / len;
    return out;
  }

  normalizeSelf(): this {
    const len = this.length();
    this.x /= len;
    this.y /= len;
    this.z /= len;
    return this;
  }

  // Color operations
  getRGB(out: Vector3): Vector3 {
    out.x = this.x;
    out.y = this.y;
    out.z = this.z;
    return out;
  }

  getHSL(out: Vector3): Vector3 {
    const max = Math.max(this.x, this.y, this.z);
    const min = Math.min(this.x, this.y, this.z);
    const delta = max - min;

    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));

      if (max === this.x) {
        h = (this.y - this.z) / delta + (this.y < this.z ? 6 : 0);
      } else if (max === this.y) {
        h = (this.z - this.x) / delta + 2;
      } else {
        h = (this.x - this.y) / delta + 4;
      }

      h /= 6;
    }

    out.x = h;
    out.y = s;
    out.z = l;
    return out;
  }

  static hueToRgb(p: number, q: number, t: number): number {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;

    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;

    return p;
  }

  static fromValues(x: number, y: number, z: number, out: Vector3): Vector3 {
    out.x = x;
    out.y = y;
    out.z = z;
    return out;
  }

  static fromRGB(r: number, g: number, b: number, out: Vector3): Vector3 {
    out.x = r;
    out.y = g;
    out.z = b;
    return out;
  }

  static fromHSL(h: number, s: number, l: number, out: Vector3): Vector3 {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    out.x = Vector3.hueToRgb(p, q, h + 1 / 3);
    out.y = Vector3.hueToRgb(p, q, h);
    out.z = Vector3.hueToRgb(p, q, h - 1 / 3);
    return out;
  }

  static fromAngles(
    theta: number,
    phi: number,
    length: number,
    out: Vector3
  ): Vector3 {
    out.x = length * Math.sin(theta) * Math.cos(phi);
    out.y = length * Math.sin(theta) * Math.sin(phi);
    out.z = length * Math.cos(theta);
    return out;
  }

  static dot(a: Vector3, b: Vector3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  static lerp(a: Vector3, b: Vector3, t: number, out: Vector3): Vector3 {
    out.x = a.x + (b.x - a.x) * t;
    out.y = a.y + (b.y - a.y) * t;
    out.z = a.z + (b.z - a.z) * t;
    return out;
  }
}
