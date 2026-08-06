/**
 * Grave palette.
 *
 * Everything here derives from two sets of master tokens:
 *
 * 1. Grave neutrals — the warm gray ramp provided by Grave, kept verbatim.
 *    The stops that were not provided (020/060/080 and 920-1040) are warm
 *    interpolations of the neighboring Grave stops, never cool Pierre grays.
 * 2. Hue masters — each hue is a PAIR, following how Kanagawa (and Kanso)
 *    pair their dark and light variants:
 *    - `anchor` (the 500 stop): the muted dark-mode voice, after Kanagawa
 *      Dragon, where the muted color IS the token color on near-black.
 *    - `ink` (the 600 stop): the light-mode voice, after Kanagawa Lotus /
 *      Kanso Pearl. Light variants of these themes never darken the muted
 *      anchors (that reads as mud); they re-pick darker, MORE chromatic
 *      inks that keep the same hue relationships on paper.
 *
 * Remaining stops are washes mixed toward the Grave warm white (gray 040)
 * and warm black (gray 1000), so every derived color stays in the same warm
 * key. Ramp structure follows Pierre; restraint (near-black grounds, quiet
 * punctuation, sparse color) follows base16 Black Metal (Gorgoroth) and
 * Gruvbox Material's soft-contrast philosophy.
 *
 * Syntax/state chroma is lifted one notch via `SYNTAX_SAT`, matching Kanso's
 * saturated mode (~+20% HSL saturation): inkier token color without neon
 * and without putting hue back into chrome (accent roles stay on gray).
 */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Linear sRGB-space mix of `a` toward `b` by `t` (0..1). */
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) / 6;
  else if (max === G) h = ((B - R) / d + 2) / 6;
  else h = ((R - G) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = l * 255;
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let T = t;
    if (T < 0) T += 1;
    if (T > 1) T -= 1;
    if (T < 1 / 6) return p + (q - p) * 6 * T;
    if (T < 1 / 2) return q;
    if (T < 2 / 3) return p + (q - p) * (2 / 3 - T) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1 / 3) * 255];
}

/** Relative HSL saturation boost (Kanso saturated mode ≈ 0.2). */
function saturate(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const [nr, ng, nb] = hslToRgb(h, Math.min(1, s * (1 + amount)), l);
  return rgbToHex(nr, ng, nb);
}

/** How much extra chroma syntax/state hues carry. Chrome stays on gray. */
const SYNTAX_SAT = 0.22;

// Grave master neutrals (provided stops marked). Non-provided stops are warm
// interpolations between the neighboring Grave masters.
const gray = {
  "020": "#fdfdfc",
  "040": "#FAFAF9", // Grave provided
  "060": "#f8f8f7",
  "080": "#f7f6f5",
  "100": "#F5F5F4", // Grave provided
  "200": "#E7E7E7", // Grave provided
  "300": "#D6D4D4", // Grave provided
  "400": "#A8A4A2", // Grave provided
  "500": "#777370", // Grave provided
  "600": "#565451", // Grave provided
  "700": "#44413F", // Grave provided
  "800": "#272625", // Grave provided
  "900": "#1C1A18", // Grave provided
  "920": "#191715",
  "940": "#161412",
  "960": "#121010",
  "980": "#0f0d0d",
  "1000": "#0C0A0A", // Grave provided (from your 950 stop)
  "1020": "#090808",
  "1040": "#070606",
};

const warmWhite = gray["040"];
const warmBlack = gray["1000"];

type Ramp = {
  "050": string;
  "100": string;
  "200": string;
  "300": string;
  "400": string;
  "500": string;
  "600": string;
  "700": string;
  "800": string;
  "900": string;
  "950": string;
};

/**
 * Derive a full 050-950 ramp from a hue's two masters.
 * 050-200 are paper washes of the ink (diff/selection tints on light);
 * 300-400 are pastel lifts of the anchor (ANSI brights, hints on dark);
 * 500 is the (saturated) anchor, 600 is the (saturated) ink; 700-800
 * deepen the ink; 900-950 are shadow washes of the anchor.
 */
function ramp(anchor: string, ink: string): Ramp {
  const a = saturate(anchor, SYNTAX_SAT);
  const i = saturate(ink, SYNTAX_SAT);
  return {
    "050": mix(i, warmWhite, 0.9),
    "100": mix(i, warmWhite, 0.82),
    "200": mix(i, warmWhite, 0.62),
    "300": mix(a, warmWhite, 0.38),
    "400": mix(a, warmWhite, 0.18),
    "500": a,
    "600": i,
    "700": mix(i, warmBlack, 0.18),
    "800": mix(i, warmBlack, 0.38),
    "900": mix(a, warmBlack, 0.6),
    "950": mix(a, warmBlack, 0.78),
  };
}

// Hue masters: ramp(anchor, ink) = (Kanagawa Dragon tone, Kanagawa Lotus /
// Kanso Pearl tone). Teal's pair comes from the same family (dragon aqua
// gruvbox-material-adjacent anchor, lotusAqua2 ink).
const red = ramp("#c4746e", "#c84053"); // dragonRed, lotusRed
const orange = ramp("#b6927b", "#cc6d00"); // dragonOrange, lotusOrange
const yellow = ramp("#c4b28a", "#836f4a"); // dragonYellow, lotusYellow2
const green = ramp("#87a987", "#6f894e"); // dragonGreen, lotusGreen
const mint = ramp("#8ea4a2", "#597b75"); // dragonAqua, lotusAqua
const teal = ramp("#7daea3", "#5e857a"); // gruvbox-material aqua, lotusAqua2
const cyan = ramp("#7fb4ca", "#4e8ca2"); // springBlue, lotusTeal1
const blue = ramp("#8ba4b0", "#4d699b"); // dragonBlue2, lotusBlue4
const indigo = ramp("#8992a7", "#766b90"); // dragonViolet, lotusViolet2
const purple = ramp("#957fb8", "#624c83"); // oniViolet, lotusViolet4
const pink = ramp("#a292a3", "#b35b79"); // dragonPink, lotusPink
// Kept for parity with the Pierre baseline; not wired into roles yet.
export const brown = ramp("#a08264", "#7a5f47");

export type Roles = {
  bg: { editor: string; window: string; inset: string; elevated: string };
  fg: { base: string; fg1: string; fg2: string; fg3: string; fg4: string };
  border: {
    window: string;
    editor: string;
    indentGuide: string;
    indentGuideActive: string;
    inset: string;
    elevated: string;
  };
  accent: { primary: string; link: string; subtle: string; contrastOnAccent: string };
  states: { merge: string; success: string; danger: string; warn: string; info: string };
  syntax: {
    comment: string;
    string: string;
    number: string;
    keyword: string;
    regexp: string;
    func: string;
    type: string;
    variable: string;
    operator: string;
    punctuation: string;
    constant: string;
    parameter: string;
    namespace: string;
    decorator: string;
    escape: string;
    invalid: string;
    tag: string;
    attribute: string;
  };
  ansi: {
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
    brightBlack: string;
    brightRed: string;
    brightGreen: string;
    brightYellow: string;
    brightBlue: string;
    brightMagenta: string;
    brightCyan: string;
    brightWhite: string;
  };
};

export const light: Roles = {
  bg: {
    editor: gray["020"],
    window: gray["060"],
    inset: gray["080"],
    elevated: gray["040"],
  },
  fg: {
    // Ink hierarchy, all Grave masters. Base sits at the warm-black master
    // for a Pierre-grade ink on paper; the ladder below stays soft.
    base: gray["1000"],
    fg1: gray["800"],
    fg2: gray["700"],
    fg3: gray["500"],
    fg4: gray["400"],
  },
  border: {
    window: gray["100"],
    editor: gray["200"],
    indentGuide: gray["100"],
    indentGuideActive: gray["200"],
    inset: gray["200"],
    elevated: gray["100"],
  },
  accent: {
    // Neutral chrome: the accent IS ink. Gorgoroth treats gray as its only
    // accent, Kanso's minimal mode strips chrome color, and Pierre keeps
    // the neutral ramp doing all UI work. Color lives in states/syntax.
    primary: gray["1000"],
    link: gray["1000"],
    subtle: gray["200"],
    contrastOnAccent: gray["040"], // warm white on ink buttons
  },
  states: {
    merge: indigo["600"],
    success: mint["600"],
    danger: red["600"],
    warn: orange["600"], // lotusOrange doubles as Kanagawa's light warning gold
    info: cyan["600"],
  },
  syntax: {
    comment: gray["500"],
    string: green["600"],
    number: cyan["600"],
    keyword: pink["600"],
    regexp: teal["600"],
    func: indigo["600"],
    type: purple["600"],
    variable: orange["700"], // deepened: lotusOrange alone is too light for body text
    operator: cyan["700"],
    punctuation: gray["600"],
    constant: yellow["600"],
    parameter: gray["600"],
    namespace: yellow["600"],
    decorator: blue["600"],
    escape: cyan["700"],
    invalid: red["700"],
    tag: red["600"],
    attribute: mint["600"],
  },
  ansi: {
    black: gray["900"],
    red: red["600"],
    green: green["600"],
    yellow: yellow["600"],
    blue: blue["600"],
    magenta: purple["600"],
    cyan: cyan["600"],
    white: gray["300"],
    brightBlack: gray["600"],
    brightRed: red["500"],
    brightGreen: green["500"],
    brightYellow: yellow["500"],
    brightBlue: blue["500"],
    brightMagenta: purple["500"],
    brightCyan: cyan["500"],
    brightWhite: gray["100"],
  },
};

export const dark: Roles = {
  bg: {
    editor: gray["1040"],
    window: gray["1000"],
    inset: gray["980"],
    elevated: gray["1020"],
  },
  fg: {
    // Descends the Grave masters directly. Base sits at gray 100 for a
    // Pierre-grade near-white ink on the black ground, while staying short
    // of pure white; the ladder below keeps the references' restraint.
    base: gray["100"],
    fg1: gray["300"],
    fg2: gray["400"],
    fg3: gray["500"],
    fg4: gray["600"],
  },
  border: {
    window: gray["1040"],
    editor: gray["980"],
    indentGuide: gray["980"],
    indentGuideActive: gray["960"],
    inset: gray["980"],
    elevated: gray["980"],
  },
  accent: {
    // Neutral chrome, mirroring the light theme: near-white ink accent on
    // the black ground, warm-gray washes for selections and hovers.
    primary: gray["100"],
    link: gray["100"],
    subtle: gray["800"],
    contrastOnAccent: gray["1000"], // ink text on near-white buttons
  },
  states: {
    merge: indigo["500"],
    success: mint["500"],
    danger: red["500"],
    warn: yellow["500"],
    info: cyan["500"],
  },
  syntax: {
    // The anchors are the token colors, exactly as Kanagawa Dragon uses
    // its muted palette; no lightening pass in between.
    comment: gray["500"], // Grave #777370 ~ Kanagawa fujiGray #727169
    string: green["500"],
    number: cyan["500"],
    keyword: pink["500"],
    regexp: teal["500"],
    func: indigo["500"],
    type: purple["500"],
    variable: orange["500"],
    operator: cyan["500"],
    punctuation: gray["400"], // Grave #A8A4A2 ~ dragonGray #a6a69c
    constant: yellow["500"],
    parameter: indigo["400"], // pale-violet lift, after springViolet2
    namespace: yellow["400"],
    decorator: blue["500"],
    escape: cyan["400"],
    invalid: red["400"],
    tag: red["500"],
    attribute: mint["500"],
  },
  ansi: {
    black: gray["1000"],
    red: red["500"],
    green: green["500"],
    yellow: yellow["500"],
    blue: blue["500"],
    magenta: purple["500"],
    cyan: cyan["500"],
    white: gray["300"],
    brightBlack: gray["600"],
    brightRed: red["400"],
    brightGreen: green["400"],
    brightYellow: yellow["400"],
    brightBlue: blue["400"],
    brightMagenta: purple["400"],
    brightCyan: cyan["400"],
    brightWhite: gray["100"],
  },
};
