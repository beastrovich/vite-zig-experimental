function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;

  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;

  return p;
}

export type Color = [number, number, number, number];

export namespace ColorF {
  export function create(
    r: number = 0,
    g: number = 0,
    b: number = 0,
    a: number = 1
  ): Color {
    return [r, g, b, a];
  }

  export function set(
    color: Color,
    r: number,
    g: number,
    b: number,
    a: number
  ): Color {
    color[0] = r;
    color[1] = g;
    color[2] = b;
    color[3] = a;
    return color;
  }

  export function reset(color: Color): Color {
    color[0] = 0;
    color[1] = 0;
    color[2] = 0;
    color[3] = 1;
    return color;
  }

  export function zero(color: Color): Color {
    color[0] = 0;
    color[1] = 0;
    color[2] = 0;
    color[3] = 0;
    return color;
  }

  export function copyTo(target: Color, source: Color): Color {
    target[0] = source[0];
    target[1] = source[1];
    target[2] = source[2];
    target[3] = source[3];
    return target;
  }

  export function convertRgbToHsl(target: Color, source: Color): Color {
    const r = source[0];
    const g = source[1];
    const b = source[2];

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));

      if (max === r) {
        h = (g - b) / delta + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / delta + 2;
      } else {
        h = (r - g) / delta + 4;
      }

      h /= 6;
    }

    target[0] = h;
    target[1] = s;
    target[2] = l;
    target[3] = source[3];
    return target;
  }

  export function convertHslToRgb(target: Color, source: Color): Color {
    const h = source[0];
    const s = source[1];
    const l = source[2];

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    target[0] = hueToRgb(p, q, h + 1 / 3);
    target[1] = hueToRgb(p, q, h);
    target[2] = hueToRgb(p, q, h - 1 / 3);
    target[3] = source[3];
    return target;
  }

  export function lerp(target: Color, a: Color, b: Color, t: number): Color {
    target[0] = a[0] + (b[0] - a[0]) * t;
    target[1] = a[1] + (b[1] - a[1]) * t;
    target[2] = a[2] + (b[2] - a[2]) * t;
    target[3] = a[3] + (b[3] - a[3]) * t;
    return target;
  }
}

// export class ColorRGBAF {
//   constructor(public r: number = 0, public g: number = 0, public b: number = 0, public a: number = 1) {}

//   // toString() {
//   //   return `rgb(${this.r}, ${this.g}, ${this.b})`
//   // }

//   set(r: number, g: number, b: number, a: number): this {
//     this.r = r;
//     this.g = g;
//     this.b = b;
//     this.a = a;
//     return this;
//   }

//   copyFrom({ r, g, b, a  }: ColorRGBAF): this {
//     this.r = r;
//     this.g = g;
//     this.b = b;
//     this.a = a;
//     return this;
//   }

//   copyConvertFromHSL({ h, s, l, a }: ColorHSLAF): this {
//     const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//     const p = 2 * l - q;

//     this.r = hueToRgb(p, q, h + 1 / 3);
//     this.g = hueToRgb(p, q, h);
//     this.b = hueToRgb(p, q, h - 1 / 3);
//     this.a = a;
//     return this;
//   }
// }

// export class ColorHSLAF {
//   constructor(public h: number, public s: number, public l: number, public a: number) {}

//   copyFrom({ h, s, l, a }: ColorHSLAF): this {
//     this.h = h;
//     this.s = s;
//     this.l = l;
//     this.a = a;
//     return this;
//   }

//   copyConvertFromRGB({ r, g, b }: ColorRGBAF): this {
//     const max = Math.max(r, g, b);
//     const min = Math.min(r, g, b);
//     const delta = max - min;

//     let h = 0;
//     let s = 0;
//     let l = (max + min) / 2;

//     if (delta !== 0) {
//       s = delta / (1 - Math.abs(2 * l - 1));

//       if (max === r) {
//         h = (g - b) / delta + (g < b ? 6 : 0);
//       } else if (max === g) {
//         h = (b - r) / delta + 2;
//       } else {
//         h = (r - g) / delta + 4;
//       }

//       h /= 6;
//     }

//     this.h = h;
//     this.s = s;
//     this.l = l;
//     return this;
//   }
// }
