import { readFileSync, writeFileSync } from "node:fs";

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error("Usage: node script/convert-mysql-dump.mjs <input.sql> <output.sql>");
  process.exit(1);
}

const input = readFileSync(inputPath, "utf8");
const insertRegex = /INSERT INTO\s+`[^`]+`[\s\S]*?;/gi;
const insertsByTable = new Map();

let match;
while ((match = insertRegex.exec(input)) !== null) {
  const statement = match[0];
  const tableMatch = statement.match(/INSERT INTO\s+`([^`]+)`/i);
  if (!tableMatch) continue;
  const table = tableMatch[1];
  if (!insertsByTable.has(table)) insertsByTable.set(table, []);
  insertsByTable.get(table).push(statement);
}

const tableOrder = [
  "user",
  "room",
  "amenities",
  "roomamenities",
  "cart",
  "cartitem",
  "reservation",
  "payment",
  "customorder",
  "order",
  "orderitem",
  "account",
  "passwordresettoken",
];

const truncateTables = [
  "account",
  "amenities",
  "cartitem",
  "cart",
  "customorder",
  "orderitem",
  "order",
  "passwordresettoken",
  "payment",
  "reservation",
  "roomamenities",
  "room",
  "user",
];

const out = [];
out.push("-- Generated from MySQL dump for PostgreSQL");
out.push("BEGIN;");
out.push("SET standard_conforming_strings = off;");
out.push(`TRUNCATE ${truncateTables.map((t) => `"${t}"`).join(", ")} CASCADE;`);

const convertStatement = (stmt) => stmt.replace(/`/g, "\"");
const writtenTables = new Set();

for (const table of tableOrder) {
  const statements = insertsByTable.get(table) ?? [];
  for (const stmt of statements) out.push(convertStatement(stmt));
  if (statements.length) writtenTables.add(table);
}

for (const [table, statements] of insertsByTable.entries()) {
  if (writtenTables.has(table)) continue;
  for (const stmt of statements) out.push(convertStatement(stmt));
}

out.push("COMMIT;");
out.push("");

writeFileSync(outputPath, out.join("\n"));
console.log(`Converted ${insertsByTable.size} table(s) into ${outputPath}`);
