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
 * 500 is the anchor, 600 is the ink; 700-800 deepen the ink;
 * 900-950 are shadow washes of the anchor (subtle backgrounds on dark).
 */
function ramp(anchor: string, ink: string): Ramp {
  return {
    "050": mix(ink, warmWhite, 0.9),
    "100": mix(ink, warmWhite, 0.82),
    "200": mix(ink, warmWhite, 0.62),
    "300": mix(anchor, warmWhite, 0.38),
    "400": mix(anchor, warmWhite, 0.18),
    "500": anchor,
    "600": ink,
    "700": mix(ink, warmBlack, 0.18),
    "800": mix(ink, warmBlack, 0.38),
    "900": mix(anchor, warmBlack, 0.6),
    "950": mix(anchor, warmBlack, 0.78),
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
    // Soft ink hierarchy, all Grave masters: no pure black text (Kanso
    // Pearl / Gruvbox Material soft-contrast philosophy).
    base: gray["900"],
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
    primary: blue["600"],
    link: blue["600"],
    subtle: blue["100"],
    contrastOnAccent: gray["040"], // warm white carries on the lotus blue ink
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
    // Descends the Grave masters directly. No pure white: Kanagawa Dragon
    // (#c5c9c5), Kanso (#C5C9C7) and Gorgoroth (#c1c1c1) all cap the dark
    // foreground well below white; gray 200 keeps that restraint while
    // holding up on our blacker ground.
    base: gray["200"],
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
    primary: blue["500"],
    link: blue["500"],
    subtle: blue["950"],
    contrastOnAccent: gray["1040"],
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
