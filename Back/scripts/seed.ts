import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createSeedDatabase } from "@/lib/db/seed-data";
import { DEFAULT_DEMO_DB_PATH, saveDemoDatabase } from "@/lib/db/local-store";

const dbPath = process.env.LOCAL_DB_PATH ?? DEFAULT_DEMO_DB_PATH;
const publicRoot = process.env.LOCAL_PUBLIC_STORAGE ?? "./storage/public";
const privateRoot = process.env.LOCAL_PRIVATE_STORAGE ?? "./storage/private";

async function touchDemoFile(path: string, contents: string) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents, "utf8");
}

const database = createSeedDatabase();
await saveDemoDatabase(database, dbPath);
await touchDemoFile(`${publicRoot}/reports/demo-report.pdf`, "local demo public report placeholder\n");
await touchDemoFile(`${publicRoot}/recruiting/application-form.pdf`, "local demo application placeholder\n");
await touchDemoFile(`${publicRoot}/recruiting/recruiting-guide.pdf`, "local demo recruiting guide placeholder\n");
await touchDemoFile(`${privateRoot}/teams/ib/demo-team-material.pdf`, "local demo private team material placeholder\n");

console.log(`Seeded local demo database at ${dbPath}`);
console.log("Demo accounts: admin/admin1234, pending/pending1234, member/member1234, interview/interview1234");
console.log("These credentials are local-demo only and must never be used in production.");
