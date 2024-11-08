// path: @/math/matrix3x3.ts

import { Vector2 } from "./vector2";

/**
 * A mutable 3x3 matrix implemented as a C-like structure.
 * All operations that return a Matrix3x3 modify their output parameter.
 * Methods ending in 'Self' modify the matrix instance itself.
 *
 * Matrix layout:
 * | m00 m01 m02 |
 * | m10 m11 m12 |
 * | m20 m21 m22 |
 *
 * Note: This implementation prioritizes performance over safety.
 * - No parameter validation is performed
 */
export class Matrix3x3 {
  constructor(
    public m00: number = 1,
    public m01: number = 0,
    public m02: number = 0,
    public m10: number = 0,
    public m11: number = 1,
    public m12: number = 0,
    public m20: number = 0,
    public m21: number = 0,
    public m22: number = 1
  ) {}

  copyTo(out: Matrix3x3): Matrix3x3 {
    out.m00 = this.m00;
    out.m01 = this.m01;
    out.m02 = this.m02;
    out.m10 = this.m10;
    out.m11 = this.m11;
    out.m12 = this.m12;
    out.m20 = this.m20;
    out.m21 = this.m21;
    out.m22 = this.m22;
    return out;
  }

  setIdentity(): this {
    this.m00 = 1;
    this.m01 = 0;
    this.m02 = 0;
    this.m10 = 0;
    this.m11 = 1;
    this.m12 = 0;
    this.m20 = 0;
    this.m21 = 0;
    this.m22 = 1;
    return this;
  }

  scaleUniform(s: number, out: Matrix3x3): Matrix3x3 {
    out.m00 = this.m00 * s;
    out.m01 = this.m01 * s;
    out.m02 = this.m02 * s;
    out.m10 = this.m10 * s;
    out.m11 = this.m11 * s;
    out.m12 = this.m12 * s;
    out.m20 = this.m20 * s;
    out.m21 = this.m21 * s;
    out.m22 = this.m22 * s;
    return out;
  }

  scaleUniformSelf(s: number): this {
    this.m00 *= s;
    this.m01 *= s;
    this.m02 *= s;
    this.m10 *= s;
    this.m11 *= s;
    this.m12 *= s;
    this.m20 *= s;
    this.m21 *= s;
    this.m22 *= s;
    return this;
  }

  scale(s: Vector2, out: Matrix3x3): Matrix3x3 {
    out.m00 = this.m00 * s.x;
    out.m01 = this.m01 * s.x;
    out.m02 = this.m02 * s.x;
    out.m10 = this.m10 * s.y;
    out.m11 = this.m11 * s.y;
    out.m12 = this.m12 * s.y;
    out.m20 = this.m20;
    out.m21 = this.m21;
    out.m22 = this.m22;
    return out;
  }

  scaleSelf(s: Vector2): this {
    this.m00 *= s.x;
    this.m01 *= s.x;
    this.m02 *= s.x;
    this.m10 *= s.y;
    this.m11 *= s.y;
    this.m12 *= s.y;
    return this;
  }

  translate(v: Vector2, out: Matrix3x3): Matrix3x3 {
    out.m00 = this.m00;
    out.m01 = this.m01;
    out.m02 = this.m02 + v.x;
    out.m10 = this.m10;
    out.m11 = this.m11;
    out.m12 = this.m12 + v.y;
    out.m20 = this.m20;
    out.m21 = this.m21;
    out.m22 = this.m22;
    return out;
  }

  translateSelf(v: Vector2): this {
    this.m02 += v.x;
    this.m12 += v.y;
    return this;
  }

  rotate(radians: number, out: Matrix3x3): Matrix3x3 {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    out.m00 = this.m00 * c - this.m01 * s;
    out.m01 = this.m00 * s + this.m01 * c;
    out.m02 = this.m02;
    out.m10 = this.m10 * c - this.m11 * s;
    out.m11 = this.m10 * s + this.m11 * c;
    out.m12 = this.m12;
    out.m20 = this.m20 * c - this.m21 * s;
    out.m21 = this.m20 * s + this.m21 * c;
    out.m22 = this.m22;
    return out;
  }

  rotateSelf(radians: number): this {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    const m00 = this.m00 * c - this.m01 * s;
    const m01 = this.m00 * s + this.m01 * c;
    const m10 = this.m10 * c - this.m11 * s;
    const m11 = this.m10 * s + this.m11 * c;
    const m20 = this.m20 * c - this.m21 * s;
    const m21 = this.m20 * s + this.m21 * c;
    this.m00 = m00;
    this.m01 = m01;
    this.m10 = m10;
    this.m11 = m11;
    this.m20 = m20;
    this.m21 = m21;
    return this;
  }

  multiply(other: Matrix3x3, out: Matrix3x3): Matrix3x3 {
    out.m00 =
      this.m00 * other.m00 + this.m01 * other.m10 + this.m02 * other.m20;
    out.m01 =
      this.m00 * other.m01 + this.m01 * other.m11 + this.m02 * other.m21;
    out.m02 =
      this.m00 * other.m02 + this.m01 * other.m12 + this.m02 * other.m22;
    out.m10 =
      this.m10 * other.m00 + this.m11 * other.m10 + this.m12 * other.m20;
    out.m11 =
      this.m10 * other.m01 + this.m11 * other.m11 + this.m12 * other.m21;
    out.m12 =
      this.m10 * other.m02 + this.m11 * other.m12 + this.m12 * other.m22;
    out.m20 =
      this.m20 * other.m00 + this.m21 * other.m10 + this.m22 * other.m20;
    out.m21 =
      this.m20 * other.m01 + this.m21 * other.m11 + this.m22 * other.m21;
    out.m22 =
      this.m20 * other.m02 + this.m21 * other.m12 + this.m22 * other.m22;
    return out;
  }

  multiplySelf(other: Matrix3x3): this {
    const m00 =
      this.m00 * other.m00 + this.m01 * other.m10 + this.m02 * other.m20;
    const m01 =
      this.m00 * other.m01 + this.m01 * other.m11 + this.m02 * other.m21;
    const m02 =
      this.m00 * other.m02 + this.m01 * other.m12 + this.m02 * other.m22;
    const m10 =
      this.m10 * other.m00 + this.m11 * other.m10 + this.m12 * other.m20;
    const m11 =
      this.m10 * other.m01 + this.m11 * other.m11 + this.m12 * other.m21;
    const m12 =
      this.m10 * other.m02 + this.m11 * other.m12 + this.m12 * other.m22;
    const m20 =
      this.m20 * other.m00 + this.m21 * other.m10 + this.m22 * other.m20;
    const m21 =
      this.m20 * other.m01 + this.m21 * other.m11 + this.m22 * other.m21;
    const m22 =
      this.m20 * other.m02 + this.m21 * other.m12 + this.m22 * other.m22;

    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;
    this.m10 = m10;
    this.m11 = m11;
    this.m12 = m12;
    this.m20 = m20;
    this.m21 = m21;
    this.m22 = m22;
    return this;
  }

  transpose(out: Matrix3x3): Matrix3x3 {
    out.m00 = this.m00;
    out.m01 = this.m10;
    out.m02 = this.m20;
    out.m10 = this.m01;
    out.m11 = this.m11;
    out.m12 = this.m21;
    out.m20 = this.m02;
    out.m21 = this.m12;
    out.m22 = this.m22;
    return out;
  }

  transposeSelf(): this {
    const m01 = this.m10;
    const m02 = this.m20;
    const m10 = this.m01;
    const m12 = this.m21;
    const m20 = this.m02;
    const m21 = this.m12;

    this.m01 = m01;
    this.m02 = m02;
    this.m10 = m10;
    this.m12 = m12;
    this.m20 = m20;
    this.m21 = m21;
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
    out.m21 = this.m10;
    out.m22 = this.m11;
    out.m23 = this.m12;
    out.m31 = this.m20;
    out.m32 = this.m21;
    out.m33 = this.m22;
    return out;
  }

  static fromTranslation(v: Vector2, out: Matrix3x3): Matrix3x3 {
    out.m00 = 1;
    out.m01 = 0;
    out.m02 = v.x;
    out.m10 = 0;
    out.m11 = 1;
    out.m12 = v.y;
    out.m20 = 0;
    out.m21 = 0;
    out.m22 = 1;
    return out;
  }

  static fromRotation(radians: number, out: Matrix3x3): Matrix3x3 {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    out.m00 = c;
    out.m01 = -s;
    out.m02 = 0;
    out.m10 = s;
    out.m11 = c;
    out.m12 = 0;
    out.m20 = 0;
    out.m21 = 0;
    out.m22 = 1;
    return out;
  }

  static fromScaleUniform(scale: number, out: Matrix3x3): Matrix3x3 {
    out.m00 = scale;
    out.m01 = 0;
    out.m02 = 0;
    out.m10 = 0;
    out.m11 = scale;
    out.m12 = 0;
    out.m20 = 0;
    out.m21 = 0;
    out.m22 = 1;
    return out;
  }

  static fromScale(v: Vector2, out: Matrix3x3): Matrix3x3 {
    out.m00 = v.x;
    out.m01 = 0;
    out.m02 = 0;
    out.m10 = 0;
    out.m11 = v.y;
    out.m12 = 0;
    out.m20 = 0;
    out.m21 = 0;
    out.m22 = 1;
    return out;
  }
}
