import { mkdirSync, writeFileSync } from "node:fs";
import { convertRolesToP3 } from "./color-p3";
import { dark as rolesDark, light as rolesLight } from "./palette";
import { makeTheme } from "./theme";
import { makeZedThemeFamily } from "./zed-theme";

mkdirSync("themes", { recursive: true });
mkdirSync("zed/themes", { recursive: true });

const rolesLightP3 = convertRolesToP3(rolesLight);
const rolesDarkP3 = convertRolesToP3(rolesDark);

const vscodeThemes = [
  { file: "themes/grave-light.json", theme: makeTheme("Grave Light", "light", rolesLight) },
  { file: "themes/grave-dark.json", theme: makeTheme("Grave Dark", "dark", rolesDark) },
  { file: "themes/grave-light-vibrant.json", theme: makeTheme("Grave Light Vibrant", "light", rolesLightP3) },
  { file: "themes/grave-dark-vibrant.json", theme: makeTheme("Grave Dark Vibrant", "dark", rolesDarkP3) },
];

for (const { file, theme } of vscodeThemes) {
  writeFileSync(file, JSON.stringify(theme, null, 2), "utf8");
  console.log("Wrote", file);
}

const zedTheme = makeZedThemeFamily("Grave", "graveoffice", [
  { name: "Grave Light", appearance: "light", roles: rolesLight },
  { name: "Grave Dark", appearance: "dark", roles: rolesDark },
]);

writeFileSync("zed/themes/grave.json", JSON.stringify(zedTheme, null, 2), "utf8");
console.log("Wrote zed/themes/grave.json");

mkdirSync("dist", { recursive: true });

const themeNames: string[] = [];

const themeDts = `/** VS Code / TextMate theme object (frozen at runtime). */
interface GraveTheme {
  readonly name: string;
  readonly type: "light" | "dark";
  readonly colors: Readonly<Record<string, string>>;
  readonly tokenColors: ReadonlyArray<{
    readonly name?: string;
    readonly scope?: string | string[];
    readonly settings: Readonly<Record<string, string>>;
  }>;
  readonly semanticTokenColors: Readonly<Record<string, string | Record<string, string>>>;
}

declare const theme: GraveTheme;
export default theme;
`;

for (const { file, theme } of vscodeThemes) {
  const name = file.replace("themes/", "").replace(".json", "");
  themeNames.push(name);
  const json = JSON.stringify(theme);
  const escaped = json.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const mjs = `export default Object.freeze(JSON.parse('${escaped}'))\n`;
  writeFileSync(`dist/${name}.mjs`, mjs, "utf8");
  writeFileSync(`dist/${name}.d.mts`, themeDts, "utf8");
  console.log("Wrote", `dist/${name}.mjs`, `+ .d.mts`);
}

writeFileSync("dist/index.mjs", `export const themeNames = ${JSON.stringify(themeNames)}\n`, "utf8");
writeFileSync("dist/index.d.mts", "export declare const themeNames: readonly string[];\n", "utf8");
console.log("Wrote dist/index.mjs + .d.mts");
