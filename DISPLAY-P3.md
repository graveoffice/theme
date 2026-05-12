# Display P3 Color Space Implementation

This document covers the Display P3 color space implementation for the Grave theme, including technical details for future reference.

## Overview

The vibrant theme variants (`grave-light-vibrant.json` and `grave-dark-vibrant.json`) use CSS `color(display-p3 r g b)` format with saturation enhancement to fully utilize Display P3's wider color gamut. These themes are designed for web projects using [Shiki](https://shiki.style/) syntax highlighting. They won't work in VS Code itself, as VS Code only supports hex/RGB color formats.

## Color Conversion Process

### 1. Linear Transformation

```typescript
// 1. Parse hex -> RGB (0-1 range)
const [r, g, b] = hexToRgb01(hex);

// 2. Linearize sRGB (remove gamma)
const linear = srgbToLinear(rgb);

// 3. Transform to P3 color space (matrix transformation)
const [rP3, gP3, bP3] = linearSrgbToLinearP3(linearR, linearG, linearB);

// 4. Apply P3 gamma
const displayP3 = linearToP3(linearP3);
```

**Transformation Matrix** (linear sRGB -> linear P3):
```
R_p3 = 0.82246197 * R_srgb + 0.17753803 * G_srgb
G_p3 = 0.03319420 * R_srgb + 0.96680580 * G_srgb
B_p3 = 0.01708263 * R_srgb + 0.07239744 * G_srgb + 0.91051993 * B_srgb
```

### 2. Gamut Enhancement

After P3 conversion, colors are enhanced to push into the wider gamut:

```typescript
// 1. Convert to HSL for easier manipulation
const [h, s, l] = rgbToHsl(r, g, b);

// 2. Skip neutrals (grays, near-blacks/whites)
if (s < 0.1 || l < 0.1 || l > 0.9) return [r, g, b];

// 3. Boost saturation (15-30% based on original)
const saturationBoost = 0.15 + s * 0.15;
const newS = Math.min(1.0, s + s * saturationBoost);

// 4. Boost luminance for vibrant colors (5%)
let newL = l;
if (s > 0.5 && l < 0.7) {
  newL = Math.min(0.9, l + l * 0.05);
}

// 5. Convert back to RGB -> format as CSS
return `color(display-p3 ${r} ${g} ${b})`;
```

This enhancement pushes colors into P3 gamut regions not accessible in sRGB, making them noticeably more vibrant on compatible displays.

## Relevant files

- `src/color-p3.ts` - Color conversion and enhancement
- `src/demo-p3.ts` - Demo showing conversions (`npx ts-node src/demo-p3.ts`)

## Testing

```bash
# View color conversions
npx ts-node src/demo-p3.ts

# Rebuild themes
npm run build

# Run tests
npm test
```
