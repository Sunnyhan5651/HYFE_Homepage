import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { query } from "@/lib/db/postgres";

if (!process.env.DATABASE_URL?.trim()) {
  throw new Error("DATABASE_URL is required. Set it before running npm run migrate.");
}

const schemaPath = resolve("src/lib/db/schema.sql");
const schema = await readFile(schemaPath, "utf8");
const statements = schema
  .split(/;\s*(?:\r?\n|$)/)
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await query(statement);
}

console.log(`Applied ${statements.length} migration statements from ${schemaPath}`);
