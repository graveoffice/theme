import { existsSync, readFileSync } from "node:fs";
import { dark as rolesDark, light as rolesLight } from "./palette";
import { makeTheme } from "./theme";

const usedColors = new Set<string>();

function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
}

function isValidP3Color(color: string): boolean {
  return /^color\(display-p3\s+[\d.]+\s+[\d.]+\s+[\d.]+(\s+\/\s+[\d.]+)?\)$/.test(color);
}

function isValidColor(color: string): boolean {
  return isValidHexColor(color) || isValidP3Color(color);
}

function collectColors(obj: any, path = ""): string[] {
  const issues: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    if (typeof value === "string") {
      usedColors.add(value);
      if ((value.startsWith("#") || value.startsWith("color(")) && !isValidColor(value)) {
        issues.push(`Invalid color at ${currentPath}: ${value}`);
      }
    } else if (typeof value === "object" && value !== null) {
      issues.push(...collectColors(value, currentPath));
    }
  }
  return issues;
}

function testThemeGeneration(themeName: string, themeType: "light" | "dark", roles: any) {
  console.log(`\nTesting ${themeName}...`);
  const errors: string[] = [];
  try {
    const theme = makeTheme(themeName, themeType, roles);
    if (!theme.name) errors.push("Missing theme name");
    if (!theme.type) errors.push("Missing theme type");
    if (!theme.colors) errors.push("Missing colors object");
    if (!theme.tokenColors) errors.push("Missing tokenColors array");
    if (!theme.semanticTokenColors) errors.push("Missing semanticTokenColors object");
    if (theme.type !== themeType) errors.push(`Expected type "${themeType}" but got "${theme.type}"`);

    const criticalColors = [
      "editor.background",
      "editor.foreground",
      "foreground",
      "focusBorder",
      "sideBar.background",
      "activityBar.background",
      "statusBar.background",
    ];
    for (const key of criticalColors) {
      if (!theme.colors[key]) errors.push(`Missing critical color: ${key}`);
    }

    errors.push(...collectColors(theme.colors));
    for (const [key, value] of Object.entries(theme.colors)) {
      if (value === undefined || value === null) errors.push(`Color "${key}" is ${value}`);
    }

    if (!Array.isArray(theme.tokenColors)) errors.push("tokenColors is not an array");
    else if (theme.tokenColors.length === 0) errors.push("tokenColors array is empty");

    theme.tokenColors.forEach((token: any, idx: number) => {
      if (!token.scope) errors.push(`tokenColors[${idx}] missing scope`);
      if (!token.settings) errors.push(`tokenColors[${idx}] missing settings`);
      else if (token.settings.foreground) {
        usedColors.add(token.settings.foreground);
        if (!isValidColor(token.settings.foreground)) {
          errors.push(`tokenColors[${idx}] has invalid foreground color: ${token.settings.foreground}`);
        }
      }
    });

    for (const [key, value] of Object.entries(theme.semanticTokenColors)) {
      if (typeof value === "string") {
        usedColors.add(value);
        if (!isValidColor(value)) errors.push(`semanticTokenColors["${key}"] has invalid color: ${value}`);
      } else if (typeof value === "object" && value !== null) {
        const semanticValue = value as any;
        if (semanticValue.foreground) {
          usedColors.add(semanticValue.foreground);
          if (!isValidColor(semanticValue.foreground)) {
            errors.push(`semanticTokenColors["${key}"].foreground has invalid color: ${semanticValue.foreground}`);
          }
        }
      }
    }

    if (errors.length === 0) {
      console.log(`${themeName} passed all checks`);
      return true;
    }
    console.error(`${themeName} failed with ${errors.length} error(s):`);
    errors.forEach((err) => console.error(`- ${err}`));
    return false;
  } catch (error) {
    console.error(`${themeName} threw an error:`, error);
    return false;
  }
}

function testGeneratedFiles() {
  console.log("\nTesting generated theme files...");
  const errors: string[] = [];
  const files = [
    { path: "themes/grave-light.json", expectedType: "light" },
    { path: "themes/grave-dark.json", expectedType: "dark" },
    { path: "themes/grave-light-vibrant.json", expectedType: "light" },
    { path: "themes/grave-dark-vibrant.json", expectedType: "dark" },
  ];

  for (const { path, expectedType } of files) {
    if (!existsSync(path)) {
      errors.push(`File does not exist: ${path}`);
      continue;
    }
    try {
      const content = readFileSync(path, "utf8");
      if (content.trim() === "") {
        errors.push(`File is empty: ${path}`);
        continue;
      }
      const theme = JSON.parse(content);
      if (!theme.name) errors.push(`${path}: Missing name`);
      if (!theme.type) errors.push(`${path}: Missing type`);
      if (theme.type !== expectedType) errors.push(`${path}: Expected type "${expectedType}" but got "${theme.type}"`);
      if (!theme.colors || Object.keys(theme.colors).length === 0) errors.push(`${path}: Missing or empty colors object`);
      if (!Array.isArray(theme.tokenColors) || theme.tokenColors.length === 0) errors.push(`${path}: Missing or empty tokenColors array`);
      console.log(`${path} is valid`);
    } catch (error) {
      errors.push(`${path}: Invalid JSON - ${error}`);
    }
  }

  if (errors.length > 0) {
    console.error("Generated files validation failed:");
    errors.forEach((err) => console.error(`- ${err}`));
    return false;
  }

  console.log("All generated files are valid");
  return true;
}

function testPaletteRoles() {
  console.log("\nTesting palette roles...");
  const errors: string[] = [];

  function validateRoles(roles: any, name: string) {
    const requiredCategories = ["bg", "fg", "border", "accent", "states", "syntax", "ansi"];
    for (const category of requiredCategories) {
      if (!roles[category]) errors.push(`${name}: Missing "${category}" category`);
    }

    function checkRoleColors(obj: any, path: string) {
      for (const [key, value] of Object.entries(obj)) {
        const fullPath = `${path}.${key}`;
        if (typeof value === "string") {
          if (!isValidHexColor(value)) errors.push(`${name}.${fullPath}: Invalid color "${value}"`);
        } else if (typeof value === "object" && value !== null) {
          checkRoleColors(value, fullPath);
        }
      }
    }

    checkRoleColors(roles, name);
  }

  validateRoles(rolesLight, "light");
  validateRoles(rolesDark, "dark");

  if (errors.length > 0) {
    console.error("Palette roles validation failed:");
    errors.forEach((err) => console.error(`- ${err}`));
    return false;
  }

  console.log("Palette roles are valid");
  return true;
}

console.log("Running Grave Theme Tests\n");
console.log("=".repeat(50));

let allPassed = true;
allPassed = testPaletteRoles() && allPassed;
allPassed = testThemeGeneration("Grave Light", "light", rolesLight) && allPassed;
allPassed = testThemeGeneration("Grave Dark", "dark", rolesDark) && allPassed;
allPassed = testGeneratedFiles() && allPassed;

console.log("\n" + "=".repeat(50));
console.log(`\nTotal unique colors used: ${usedColors.size}`);

if (allPassed) {
  console.log("\nAll tests passed");
  process.exit(0);
}

console.log("\nSome tests failed");
process.exit(1);
