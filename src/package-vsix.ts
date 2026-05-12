import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const pkgPath = join(__dirname, "..", "package.json");
const original = readFileSync(pkgPath, "utf-8");
const pkg = JSON.parse(original) as { name: string };
const originalName = pkg.name;
pkg.name = "grave-theme";

try {
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  execSync("vsce package", { stdio: "inherit", cwd: join(__dirname, "..") });
} finally {
  writeFileSync(pkgPath, original);
  console.log(`Restored package name: ${originalName}`);
}
