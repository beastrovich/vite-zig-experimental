// path: @/data-buffers.ts

import { Vector2, Vector3 } from "./math";

/**
 * Buffer for storing Vector2 components contiguously.
 * Provides zero-allocation read/write operations when using provided workspace vectors.
 */
export class Vector2Buffer {
  private _data: Float32Array;
  private _freeStartOffset: number = 0;

  constructor(public capacity: number) {
    // round up to nearest power of 2
    if (capacity < 8) {
      capacity = 8;
    } else {
      capacity = Math.pow(2, Math.ceil(Math.log2(capacity)));
    }

    const bufferCap = capacity << 1;
    this._data = new Float32Array(bufferCap);
  }

  get data(): Float32Array {
    return this._data;
  }

  get buffer(): ArrayBuffer {
    return this._data.buffer;
  }

  private ensureHasVacancy() {
    if (this._data.length <= this._freeStartOffset) {
      const newCapacity = this._data.length << 1;
      const newBuffer = new Float32Array(newCapacity);
      newBuffer.set(this._data);
      this._data = newBuffer;
    }
  }

  get length(): number {
    return this._freeStartOffset >> 1;
  }

  /**
   * Appends a vector to the buffer.
   */
  push(v: Vector2): void {
    this.ensureHasVacancy();
    this._data[this._freeStartOffset++] = v.x;
    this._data[this._freeStartOffset++] = v.y;
  }

  /**
   * Writes a vector at the specified index.
   */
  write(index: number, v: Vector2): void {
    this._data[index << 1] = v.x;
    this._data[(index << 1) + 1] = v.y;
  }

  /**
   * Reads a vector at the specified index into the provided output vector.
   * @param index The index to read from
   * @param out The vector to store the result in
   * @returns The output vector for chaining
   */
  read(index: number, out: Vector2): Vector2 {
    const baseIndex = index << 1;
    out.x = this._data[baseIndex];
    out.y = this._data[baseIndex + 1];
    return out;
  }

  /**
   * Removes a vector at the specified index by swapping with the last element.
   */
  remove(index: number, workspace: Vector2): void {
    const lastIndex = (this._freeStartOffset >> 1) - 1;
    if (index < lastIndex) {
      this.read(lastIndex, workspace);
      this.write(index, workspace);
    }
    this._freeStartOffset -= 2;
  }
}

/**
 * Buffer for storing Vector3 components contiguously.
 * Provides zero-allocation read/write operations when using provided workspace vectors.
 */
export class Vector3Buffer {
  private _data: Float32Array;
  private _freeStartOffset: number = 0;

  constructor(public capacity: number) {
    // round up to nearest power of 2
    if (capacity < 8) {
      capacity = 8;
    } else {
      capacity = Math.pow(2, Math.ceil(Math.log2(capacity)));
    }

    const bufferCap = capacity * 3;
    this._data = new Float32Array(bufferCap);
  }

  get data(): Float32Array {
    return this._data;
  }

  get buffer(): ArrayBuffer {
    return this._data.buffer;
  }

  private ensureHasVacancy() {
    if (this._data.length <= this._freeStartOffset) {
      const newCapacity = this._data.length << 1;
      const newBuffer = new Float32Array(newCapacity);
      newBuffer.set(this._data);
      this._data = newBuffer;
    }
  }

  get length(): number {
    return this._freeStartOffset / 3;
  }

  /**
   * Appends a vector to the buffer.
   */
  push(v: Vector3): void {
    this.ensureHasVacancy();
    this._data[this._freeStartOffset++] = v.x;
    this._data[this._freeStartOffset++] = v.y;
    this._data[this._freeStartOffset++] = v.z;
  }

  /**
   * Writes a vector at the specified index.
   */
  write(index: number, v: Vector3): void {
    const offset = index * 3;
    this._data[offset] = v.x;
    this._data[offset + 1] = v.y;
    this._data[offset + 2] = v.z;
  }

  /**
   * Reads a vector at the specified index into the provided output vector.
   * @param index The index to read from
   * @param out The vector to store the result in
   * @returns The output vector for chaining
   */
  read(index: number, out: Vector3): Vector3 {
    const offset = index * 3;
    out.x = this._data[offset];
    out.y = this._data[offset + 1];
    out.z = this._data[offset + 2];
    return out;
  }

  /**
   * Removes a vector at the specified index by swapping with the last element.
   */
  remove(index: number, workspace: Vector3): void {
    const lastIndex = this._freeStartOffset / 3 - 1;
    if (index < lastIndex) {
      this.read(lastIndex, workspace);
      this.write(index, workspace);
    }
    this._freeStartOffset -= 3;
  }
}
