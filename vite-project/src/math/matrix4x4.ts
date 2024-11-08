// path: @/math/matrix4x4.ts

import { Vector3 } from "./vector3";

/**
 * A mutable 4x4 matrix implemented as a C-like structure.
 * All operations that return a Matrix4x4 modify their output parameter.
 * Methods ending in 'Self' modify the matrix instance itself.
 *
 * Matrix layout:
 * | m00 m01 m02 m03 |
 * | m10 m11 m12 m13 |
 * | m20 m21 m22 m23 |
 * | m30 m31 m32 m33 |
 *
 * Note: This implementation prioritizes performance over safety.
 * - No parameter validation is performed
 */
export class Matrix4x4 {
  constructor(
    public m00: number = 1,
    public m01: number = 0,
    public m02: number = 0,
    public m03: number = 0,
    public m10: number = 0,
    public m11: number = 1,
    public m12: number = 0,
    public m13: number = 0,
    public m20: number = 0,
    public m21: number = 0,
    public m22: number = 1,
    public m23: number = 0,
    public m30: number = 0,
    public m31: number = 0,
    public m32: number = 0,
    public m33: number = 1
  ) {}

  setIdentity(): this {
    this.m00 = 1;
    this.m01 = 0;
    this.m02 = 0;
    this.m03 = 0;
    this.m10 = 0;
    this.m11 = 1;
    this.m12 = 0;
    this.m13 = 0;
    this.m20 = 0;
    this.m21 = 0;
    this.m22 = 1;
    this.m23 = 0;
    this.m30 = 0;
    this.m31 = 0;
    this.m32 = 0;
    this.m33 = 1;
    return this;
  }

  copyTo(out: Matrix4x4): Matrix4x4 {
    out.m00 = this.m00;
    out.m01 = this.m01;
    out.m02 = this.m02;
    out.m03 = this.m03;
    out.m10 = this.m10;
    out.m11 = this.m11;
    out.m12 = this.m12;
    out.m13 = this.m13;
    out.m20 = this.m20;
    out.m21 = this.m21;
    out.m22 = this.m22;
    out.m23 = this.m23;
    out.m30 = this.m30;
    out.m31 = this.m31;
    out.m32 = this.m32;
    out.m33 = this.m33;
    return out;
  }

  scaleUniform(s: number, out: Matrix4x4): Matrix4x4 {
    out.m00 = this.m00 * s;
    out.m01 = this.m01 * s;
    out.m02 = this.m02 * s;
    out.m03 = this.m03 * s;
    out.m10 = this.m10 * s;
    out.m11 = this.m11 * s;
    out.m12 = this.m12 * s;
    out.m13 = this.m13 * s;
    out.m20 = this.m20 * s;
    out.m21 = this.m21 * s;
    out.m22 = this.m22 * s;
    out.m23 = this.m23 * s;
    out.m30 = this.m30 * s;
    out.m31 = this.m31 * s;
    out.m32 = this.m32 * s;
    out.m33 = this.m33 * s;
    return out;
  }

  scaleUniformSelf(s: number): this {
    this.m00 *= s;
    this.m01 *= s;
    this.m02 *= s;
    this.m03 *= s;
    this.m10 *= s;
    this.m11 *= s;
    this.m12 *= s;
    this.m13 *= s;
    this.m20 *= s;
    this.m21 *= s;
    this.m22 *= s;
    this.m23 *= s;
    this.m30 *= s;
    this.m31 *= s;
    this.m32 *= s;
    this.m33 *= s;
    return this;
  }

  translate(v: Vector3, out: Matrix4x4): Matrix4x4 {
    out.m00 = this.m00;
    out.m01 = this.m01;
    out.m02 = this.m02;
    out.m03 = this.m03;
    out.m10 = this.m10;
    out.m11 = this.m11;
    out.m12 = this.m12;
    out.m13 = this.m13;
    out.m20 = this.m20;
    out.m21 = this.m21;
    out.m22 = this.m22;
    out.m23 = this.m23;
    out.m30 = this.m30 + v.x;
    out.m31 = this.m31 + v.y;
    out.m32 = this.m32 + v.z;
    out.m33 = this.m33;
    return out;
  }

  translateSelf(v: Vector3): this {
    this.m30 += v.x;
    this.m31 += v.y;
    this.m32 += v.z;
    return this;
  }

  rotateX(radians: number, out: Matrix4x4): Matrix4x4 {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    out.m00 = this.m00;
    out.m01 = this.m01;
    out.m02 = this.m02;
    out.m03 = this.m03;
    out.m10 = this.m10 * c + this.m20 * s;
    out.m11 = this.m11 * c + this.m21 * s;
    out.m12 = this.m12 * c + this.m22 * s;
    out.m13 = this.m13 * c + this.m23 * s;
    out.m20 = this.m20 * c - this.m10 * s;
    out.m21 = this.m21 * c - this.m11 * s;
    out.m22 = this.m22 * c - this.m12 * s;
    out.m23 = this.m23 * c - this.m13 * s;
    out.m30 = this.m30;
    out.m31 = this.m31;
    out.m32 = this.m32;
    out.m33 = this.m33;
    return out;
  }

  rotateXSelf(radians: number): this {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    const m10 = this.m10 * c + this.m20 * s;
    const m11 = this.m11 * c + this.m21 * s;
    const m12 = this.m12 * c + this.m22 * s;
    const m13 = this.m13 * c + this.m23 * s;
    this.m20 = this.m20 * c - this.m10 * s;
    this.m21 = this.m21 * c - this.m11 * s;
    this.m22 = this.m22 * c - this.m12 * s;
    this.m23 = this.m23 * c - this.m13 * s;
    this.m10 = m10;
    this.m11 = m11;
    this.m12 = m12;
    this.m13 = m13;
    return this;
  }

  rotateY(radians: number, out: Matrix4x4): Matrix4x4 {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    out.m00 = this.m00 * c - this.m20 * s;
    out.m01 = this.m01;
    out.m02 = this.m02 * c - this.m22 * s;
    out.m03 = this.m03;
    out.m10 = this.m10;
    out.m11 = this.m11;
    out.m12 = this.m12;
    out.m13 = this.m13;
    out.m20 = this.m00 * s + this.m20 * c;
    out.m21 = this.m21;
    out.m22 = this.m02 * s + this.m22 * c;
    out.m23 = this.m23;
    out.m30 = this.m30;
    out.m31 = this.m31;
    out.m32 = this.m32;
    out.m33 = this.m33;
    return out;
  }

  rotateYSelf(radians: number): this {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    const m00 = this.m00 * c - this.m20 * s;
    const m02 = this.m02 * c - this.m22 * s;
    const m20 = this.m00 * s + this.m20 * c;
    const m22 = this.m02 * s + this.m22 * c;
    this.m00 = m00;
    this.m02 = m02;
    this.m20 = m20;
    this.m22 = m22;
    return this;
  }

  rotateZ(radians: number, out: Matrix4x4): Matrix4x4 {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    out.m00 = this.m00 * c + this.m10 * s;
    out.m01 = this.m01 * c + this.m11 * s;
    out.m02 = this.m02 * c + this.m12 * s;
    out.m03 = this.m03 * c + this.m13 * s;
    out.m10 = this.m00 * -s + this.m10 * c;
    out.m11 = this.m01 * -s + this.m11 * c;
    out.m12 = this.m02 * -s + this.m12 * c;
    out.m13 = this.m03 * -s + this.m13 * c;
    out.m20 = this.m20;
    out.m21 = this.m21;
    out.m22 = this.m22;
    out.m23 = this.m23;
    out.m30 = this.m30;
    out.m31 = this.m31;
    out.m32 = this.m32;
    out.m33 = this.m33;
    return out;
  }

  rotateZSelf(radians: number): this {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    const m00 = this.m00 * c + this.m10 * s;
    const m01 = this.m01 * c + this.m11 * s;
    const m02 = this.m02 * c + this.m12 * s;
    const m03 = this.m03 * c + this.m13 * s;
    this.m10 = this.m00 * -s + this.m10 * c;
    this.m11 = this.m01 * -s + this.m11 * c;
    this.m12 = this.m02 * -s + this.m12 * c;
    this.m13 = this.m03 * -s + this.m13 * c;
    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;
    this.m03 = m03;
    return this;
  }

  multiply(other: Matrix4x4, out: Matrix4x4): Matrix4x4 {
    out.m00 =
      this.m00 * other.m00 +
      this.m01 * other.m10 +
      this.m02 * other.m20 +
      this.m03 * other.m30;
    out.m01 =
      this.m00 * other.m01 +
      this.m01 * other.m11 +
      this.m02 * other.m21 +
      this.m03 * other.m31;
    out.m02 =
      this.m00 * other.m02 +
      this.m01 * other.m12 +
      this.m02 * other.m22 +
      this.m03 * other.m32;
    out.m03 =
      this.m00 * other.m03 +
      this.m01 * other.m13 +
      this.m02 * other.m23 +
      this.m03 * other.m33;

    out.m10 =
      this.m10 * other.m00 +
      this.m11 * other.m10 +
      this.m12 * other.m20 +
      this.m13 * other.m30;
    out.m11 =
      this.m10 * other.m01 +
      this.m11 * other.m11 +
      this.m12 * other.m21 +
      this.m13 * other.m31;
    out.m12 =
      this.m10 * other.m02 +
      this.m11 * other.m12 +
      this.m12 * other.m22 +
      this.m13 * other.m32;
    out.m13 =
      this.m10 * other.m03 +
      this.m11 * other.m13 +
      this.m12 * other.m23 +
      this.m13 * other.m33;

    out.m20 =
      this.m20 * other.m00 +
      this.m21 * other.m10 +
      this.m22 * other.m20 +
      this.m23 * other.m30;
    out.m21 =
      this.m20 * other.m01 +
      this.m21 * other.m11 +
      this.m22 * other.m21 +
      this.m23 * other.m31;
    out.m22 =
      this.m20 * other.m02 +
      this.m21 * other.m12 +
      this.m22 * other.m22 +
      this.m23 * other.m32;
    out.m23 =
      this.m20 * other.m03 +
      this.m21 * other.m13 +
      this.m22 * other.m23 +
      this.m23 * other.m33;

    out.m30 =
      this.m30 * other.m00 +
      this.m31 * other.m10 +
      this.m32 * other.m20 +
      this.m33 * other.m30;
    out.m31 =
      this.m30 * other.m01 +
      this.m31 * other.m11 +
      this.m32 * other.m21 +
      this.m33 * other.m31;
    out.m32 =
      this.m30 * other.m02 +
      this.m31 * other.m12 +
      this.m32 * other.m22 +
      this.m33 * other.m32;
    out.m33 =
      this.m30 * other.m03 +
      this.m31 * other.m13 +
      this.m32 * other.m23 +
      this.m33 * other.m33;
    return out;
  }

  multiplySelf(other: Matrix4x4): this {
    const m00 =
      this.m00 * other.m00 +
      this.m01 * other.m10 +
      this.m02 * other.m20 +
      this.m03 * other.m30;
    const m01 =
      this.m00 * other.m01 +
      this.m01 * other.m11 +
      this.m02 * other.m21 +
      this.m03 * other.m31;
    const m02 =
      this.m00 * other.m02 +
      this.m01 * other.m12 +
      this.m02 * other.m22 +
      this.m03 * other.m32;
    const m03 =
      this.m00 * other.m03 +
      this.m01 * other.m13 +
      this.m02 * other.m23 +
      this.m03 * other.m33;

    const m10 =
      this.m10 * other.m00 +
      this.m11 * other.m10 +
      this.m12 * other.m20 +
      this.m13 * other.m30;
    const m11 =
      this.m10 * other.m01 +
      this.m11 * other.m11 +
      this.m12 * other.m21 +
      this.m13 * other.m31;
    const m12 =
      this.m10 * other.m02 +
      this.m11 * other.m12 +
      this.m12 * other.m22 +
      this.m13 * other.m32;
    const m13 =
      this.m10 * other.m03 +
      this.m11 * other.m13 +
      this.m12 * other.m23 +
      this.m13 * other.m33;

    const m20 =
      this.m20 * other.m00 +
      this.m21 * other.m10 +
      this.m22 * other.m20 +
      this.m23 * other.m30;
    const m21 =
      this.m20 * other.m01 +
      this.m21 * other.m11 +
      this.m22 * other.m21 +
      this.m23 * other.m31;
    const m22 =
      this.m20 * other.m02 +
      this.m21 * other.m12 +
      this.m22 * other.m22 +
      this.m23 * other.m32;
    const m23 =
      this.m20 * other.m03 +
      this.m21 * other.m13 +
      this.m22 * other.m23 +
      this.m23 * other.m33;

    const m30 =
      this.m30 * other.m00 +
      this.m31 * other.m10 +
      this.m32 * other.m20 +
      this.m33 * other.m30;
    const m31 =
      this.m30 * other.m01 +
      this.m31 * other.m11 +
      this.m32 * other.m21 +
      this.m33 * other.m31;
    const m32 =
      this.m30 * other.m02 +
      this.m31 * other.m12 +
      this.m32 * other.m22 +
      this.m33 * other.m32;
    const m33 =
      this.m30 * other.m03 +
      this.m31 * other.m13 +
      this.m32 * other.m23 +
      this.m33 * other.m33;

    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;
    this.m03 = m03;
    this.m10 = m10;
    this.m11 = m11;
    this.m12 = m12;
    this.m13 = m13;
    this.m20 = m20;
    this.m21 = m21;
    this.m22 = m22;
    this.m23 = m23;
    this.m30 = m30;
    this.m31 = m31;
    this.m32 = m32;
    this.m33 = m33;
    return this;
  }

  transpose(out: Matrix4x4): Matrix4x4 {
    out.m00 = this.m00;
    out.m01 = this.m10;
    out.m02 = this.m20;
    out.m03 = this.m30;
    out.m10 = this.m01;
    out.m11 = this.m11;
    out.m12 = this.m21;
    out.m13 = this.m31;
    out.m20 = this.m02;
    out.m21 = this.m12;
    out.m22 = this.m22;
    out.m23 = this.m32;
    out.m30 = this.m03;
    out.m31 = this.m13;
    out.m32 = this.m23;
    out.m33 = this.m33;
    return out;
  }

  transposeSelf(): this {
    const m01 = this.m10,
      m02 = this.m20,
      m03 = this.m30;
    const m12 = this.m21,
      m13 = this.m31;
    const m23 = this.m32;

    this.m10 = this.m01;
    this.m20 = this.m02;
    this.m30 = this.m03;
    this.m01 = m01;
    this.m21 = this.m12;
    this.m31 = this.m13;
    this.m02 = m02;
    this.m12 = m12;
    this.m32 = this.m23;
    this.m03 = m03;
    this.m13 = m13;
    this.m23 = m23;
    return this;
  }

  /**
   * Copies this matrix's values into a DOMMatrix.
   * Warning: This method allocates a new DOMMatrix object.
   * Use setToDOMMatrix() with an existing DOMMatrix to avoid allocation.
   */
  toDOMMatrix(): DOMMatrix {
    const m = new DOMMatrix();
    return this.setToDOMMatrix(m);
  }

  /**
   * Copies this matrix's values into an existing DOMMatrix.
   * @param out The DOMMatrix to modify
   * @returns The modified DOMMatrix
   */
  setToDOMMatrix(out: DOMMatrix): DOMMatrix {
    out.m11 = this.m00;
    out.m12 = this.m01;
    out.m13 = this.m02;
    out.m14 = this.m03;
    out.m21 = this.m10;
    out.m22 = this.m11;
    out.m23 = this.m12;
    out.m24 = this.m13;
    out.m31 = this.m20;
    out.m32 = this.m21;
    out.m33 = this.m22;
    out.m34 = this.m23;
    out.m41 = this.m30;
    out.m42 = this.m31;
    out.m43 = this.m32;
    out.m44 = this.m33;
    return out;
  }

  // Static factory methods
  static fromTranslation(v: Vector3, out: Matrix4x4): Matrix4x4 {
    out.setIdentity();
    out.m30 = v.x;
    out.m31 = v.y;
    out.m32 = v.z;
    return out;
  }

  static fromRotationX(radians: number, out: Matrix4x4): Matrix4x4 {
    out.setIdentity();
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    out.m11 = c;
    out.m12 = -s;
    out.m21 = s;
    out.m22 = c;
    return out;
  }

  static fromRotationY(radians: number, out: Matrix4x4): Matrix4x4 {
    out.setIdentity();
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    out.m00 = c;
    out.m02 = s;
    out.m20 = -s;
    out.m22 = c;
    return out;
  }

  static fromRotationZ(radians: number, out: Matrix4x4): Matrix4x4 {
    out.setIdentity();
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    out.m00 = c;
    out.m01 = -s;
    out.m10 = s;
    out.m11 = c;
    return out;
  }

  static fromScale(v: Vector3, out: Matrix4x4): Matrix4x4 {
    out.setIdentity();
    out.m00 = v.x;
    out.m11 = v.y;
    out.m22 = v.z;
    return out;
  }
}
