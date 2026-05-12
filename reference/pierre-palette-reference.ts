/**
 * Pierre palette reference for design work only.
 *
 * IMPORTANT:
 * - This file is intentionally not imported by the build pipeline.
 * - It is not a source of truth for the Grave theme.
 * - Use it as a side-by-side lookup in Figma while replacing colors.
 */
export const pierrePaletteReference = {
  neutral: {
    "020": "#fbfbfb",
    "040": "#f9f9f9",
    "060": "#f8f8f8",
    "080": "#f2f2f3",
    "100": "#eeeeef",
    "200": "#dbdbdd",
    "300": "#c6c6c8",
    "400": "#adadb1",
    "500": "#8E8E95",
    "600": "#84848A",
    "700": "#79797F",
    "800": "#6C6C71",
    "900": "#4A4A4E",
    "920": "#424245",
    "940": "#39393c",
    "960": "#2e2e30",
    "980": "#1F1F21",
    "1000": "#141415",
    "1020": "#0B0B0C",
    "1040": "#070707",
  },
  accentsAndStates: {
    blue500: "#009fff",
    indigo500: "#7b43f8",
    mint500: "#00cab1",
    red500: "#ff2e3f",
    yellow500: "#ffca00",
    cyan500: "#08c0ef",
  },
  syntaxExamples: {
    comment: "#84848A",
    string: "#199f43",
    number: "#1ca1c7",
    keyword: "#fc2b73",
    function: "#7b43f8",
    type: "#c635e4",
    variable: "#d47628",
  },
} as const;
