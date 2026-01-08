import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (!key || process.env[key] !== undefined) continue;
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const DISABLE_DB = process.env.DISABLE_DB === "1" || process.env.DISABLE_DB === "true";
const hasDbUrl = !!process.env.DATABASE_URL;

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`[migrate] DISABLE_DB=${DISABLE_DB} DATABASE_URL=${hasDbUrl ? "set" : "missing"}`);

run("npx", ["prisma", "generate"]);

if (!DISABLE_DB && hasDbUrl) {
  run("npx", ["prisma", "migrate", "deploy"]);
} else {
  console.log("[migrate] DB disabled or missing -> skipping prisma migrate deploy");
}
