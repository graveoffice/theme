function hexToRgb01(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "");
  const expanded = cleaned.length === 3 ? cleaned.split("").map((x) => x + x).join("") : cleaned;
  const num = parseInt(expanded, 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

function srgbToLinear(c: number): number {
  if (c <= 0.04045) return c / 12.92;
  return Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  if (c <= 0.0031308) return c * 12.92;
  return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

const linearToP3 = linearToSrgb;

function linearSrgbToLinearP3(r: number, g: number, b: number): [number, number, number] {
  const rOut = 0.82246197 * r + 0.17753803 * g + 0.0 * b;
  const gOut = 0.0331942 * r + 0.9668058 * g + 0.0 * b;
  const bOut = 0.01708263 * r + 0.07239744 * g + 0.91051993 * b;
  return [rOut, gOut, bOut];
}

function formatColorValue(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped.toFixed(6);
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l, l, l];
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)];
}

function enhanceForP3Gamut(r: number, g: number, b: number): [number, number, number] {
  const [h, s, l] = rgbToHsl(r, g, b);
  if (s < 0.1 || l < 0.1 || l > 0.9) return [r, g, b];

  const saturationBoost = 0.15 + s * 0.15;
  const newS = Math.min(1.0, s + s * saturationBoost);
  let newL = l;
  if (s > 0.5 && l < 0.7) newL = Math.min(0.9, l + l * 0.05);

  return hslToRgb(h, newS, newL);
}

export function srgbHexToP3Color(srgbHex: string, enhance = true): string {
  const hasAlpha = srgbHex.length === 9 || (srgbHex.startsWith("#") && srgbHex.length === 9);
  let alpha = "";
  let colorHex = srgbHex;

  if (hasAlpha) {
    const alphaHex = srgbHex.slice(-2);
    const alphaValue = parseInt(alphaHex, 16) / 255;
    alpha = ` / ${formatColorValue(alphaValue)}`;
    colorHex = srgbHex.slice(0, -2);
  }

  const [sR, sG, sB] = hexToRgb01(colorHex);
  const [linearSR, linearSG, linearSB] = [srgbToLinear(sR), srgbToLinear(sG), srgbToLinear(sB)];
  const [linearPR, linearPG, linearPB] = linearSrgbToLinearP3(linearSR, linearSG, linearSB);
  let [pR, pG, pB] = [linearToP3(linearPR), linearToP3(linearPG), linearToP3(linearPB)];

  if (enhance) [pR, pG, pB] = enhanceForP3Gamut(pR, pG, pB);

  return `color(display-p3 ${formatColorValue(pR)} ${formatColorValue(pG)} ${formatColorValue(pB)}${alpha})`;
}

export function convertRolesToP3<T>(obj: T): T {
  if (typeof obj === "string") {
    if ((obj as string).match(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/)) {
      return srgbHexToP3Color(obj as string) as any;
    }
    return obj;
  }

  if (Array.isArray(obj)) return obj.map((item) => convertRolesToP3(item)) as any;

  if (obj !== null && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj as any)) result[key] = convertRolesToP3(value);
    return result;
  }

  return obj;
}
