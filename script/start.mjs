import { spawnSync } from "node:child_process";

const DISABLE_DB = process.env.DISABLE_DB === "1" || process.env.DISABLE_DB === "true";
const hasDbUrl = !!process.env.DATABASE_URL;

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`[startup] DISABLE_DB=${DISABLE_DB} DATABASE_URL=${hasDbUrl ? "set" : "missing"}`);

run("npx", ["prisma", "generate"]);

if (!DISABLE_DB && hasDbUrl) {
  // Hanya jalankan db push kalau DB dipakai
  run("npx", ["prisma", "db", "push"]);
} else {
  console.log("[startup] DB disabled -> skipping prisma db push");
}

run("npx", ["next", "start"]);
