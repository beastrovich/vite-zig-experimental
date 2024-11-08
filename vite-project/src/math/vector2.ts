// path: @/math/vector2.ts

import { Matrix3x3 } from "./matrix3x3";
import { Matrix4x4 } from "./matrix4x4";

/**
 * A mutable 2D vector implemented as a C-like structure.
 * All operations that return a Vector2 modify their output parameter.
 * Methods ending in 'Self' modify the vector instance itself.
 *
 * Note: This implementation prioritizes performance over safety.
 * - No parameter validation is performed
 * - No protection against division by zero
 */
export class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}

  distance(v: Vector2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /** Modifies this vector's components. Returns this for chaining. */
  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  /** Copies this vector's components into out. Returns out for chaining. */
  copyTo(out: Vector2): Vector2 {
    out.x = this.x;
    out.y = this.y;
    return out;
  }

  /** Rotates this vector by theta radians, storing result in out. Returns out for chaining. */
  rotate(theta: number, out: Vector2): Vector2 {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    out.x = this.x * c - this.y * s;
    out.y = this.x * s + this.y * c;
    return out;
  }

  /** Rotates this vector by theta radians in place. Returns this for chaining. */
  rotateSelf(theta: number): this {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const x = this.x * c - this.y * s;
    const y = this.x * s + this.y * c;
    this.x = x;
    this.y = y;
    return this;
  }

  scale(s: number, out: Vector2): Vector2 {
    out.x = this.x * s;
    out.y = this.y * s;
    return out;
  }

  scaleSelf(s: number): this {
    this.x *= s;
    this.y *= s;
    return this;
  }

  matMul3x3(m: Matrix3x3, out: Vector2): Vector2 {
    out.x = m.m00 * this.x + m.m01 * this.y + m.m02;
    out.y = m.m10 * this.x + m.m11 * this.y + m.m12;
    return out;
  }

  matMul3x3Self(m: Matrix3x3): this {
    const x = m.m00 * this.x + m.m01 * this.y + m.m02;
    const y = m.m10 * this.x + m.m11 * this.y + m.m12;
    this.x = x;
    this.y = y;
    return this;
  }

  matMul4x4(m: Matrix4x4, out: Vector2): Vector2 {
    out.x = m.m00 * this.x + m.m01 * this.y + m.m03;
    out.y = m.m10 * this.x + m.m11 * this.y + m.m13;
    return out;
  }

  matMul4x4Self(m: Matrix4x4): this {
    const x = m.m00 * this.x + m.m01 * this.y + m.m03;
    const y = m.m10 * this.x + m.m11 * this.y + m.m13;
    this.x = x;
    this.y = y;
    return this;
  }

  subtract(v: Vector2, out: Vector2): Vector2 {
    out.x = this.x - v.x;
    out.y = this.y - v.y;
    return out;
  }

  subtractSelf(v: Vector2): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  add(v: Vector2, out: Vector2): Vector2 {
    out.x = this.x + v.x;
    out.y = this.y + v.y;
    return out;
  }

  addSelf(v: Vector2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalizeSelf(): this {
    const len = this.length();
    if (len === 0) {
      return this;
    }
    this.x /= len;
    this.y /= len;
    return this;
  }

  static fromValues(x: number, y: number, out: Vector2): Vector2 {
    out.x = x;
    out.y = y;
    return out;
  }

  static fromAngle(theta: number, length: number = 1, out: Vector2): Vector2 {
    out.x = length * Math.cos(theta);
    out.y = length * Math.sin(theta);
    return out;
  }

  static signedAngle(a: Vector2, b: Vector2, workspace: Vector2): number {
    workspace.normalizeSelf();
    const angleA = Math.atan2(workspace.y, workspace.x);

    workspace.normalizeSelf();
    const angleB = Math.atan2(workspace.y, workspace.x);

    const angle = angleA - angleB;
    return ((angle + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
  }

  static dot(a: Vector2, b: Vector2): number {
    return a.x * b.x + a.y * b.y;
  }

  static lerp(a: Vector2, b: Vector2, t: number, out: Vector2): Vector2 {
    out.x = a.x + (b.x - a.x) * t;
    out.y = a.y + (b.y - a.y) * t;
    return out;
  }
}
