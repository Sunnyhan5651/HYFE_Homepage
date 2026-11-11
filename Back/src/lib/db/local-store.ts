import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { EMPTY_DEMO_DATABASE, type DemoDatabase, type PostRecord, type PostVisibility, type UserRecord } from "@/lib/db/schema";
import { loadPostgresDatabase, savePostgresDatabase } from "@/lib/db/postgres-store";
import { shouldUsePostgres } from "@/lib/db/postgres";

export const DEFAULT_DEMO_DB_PATH = "./data/demo-db.json";
const VERCEL_RUNTIME_DEMO_DB_PATH = "/tmp/hyfe-demo-db.json";

export function defaultDemoDbPath(): string {
  return process.env.LOCAL_DB_PATH?.trim() || (process.env.VERCEL ? VERCEL_RUNTIME_DEMO_DB_PATH : DEFAULT_DEMO_DB_PATH);
}

export function cloneEmptyDatabase(): DemoDatabase {
  return structuredClone(EMPTY_DEMO_DATABASE);
}

function defaultVisibilityForPost(boardType: PostRecord["boardType"]): PostVisibility {
  return boardType === "PUBLIC_REPORT" || boardType === "RECRUIT_MATERIAL" ? "PUBLIC" : "PRIVATE";
}

function normalizePostRecord(post: PostRecord): PostRecord {
  const boardType = post.boardType.startsWith("TEAM_") && post.category === "notice" ? "MEMBER_NOTICE" : post.boardType;
  return {
    ...post,
    boardType,
    visibility: post.visibility ?? (boardType.startsWith("TEAM_") && post.category === "session-material" ? "PUBLIC" : defaultVisibilityForPost(boardType)),
    companyType: post.companyType ?? null,
    category: boardType === "MEMBER_NOTICE" && post.category === "notice" ? "general" : post.category,
  };
}

function normalizeDemoDatabase(database: DemoDatabase): DemoDatabase {
  return {
    ...database,
    posts: database.posts.map(normalizePostRecord),
  };
}

async function createRuntimeDemoDatabase(path: string): Promise<DemoDatabase> {
  const { createSeedDatabase } = await import("@/lib/db/seed-data");
  const database = createSeedDatabase();
  try {
    await saveDemoDatabase(database, path);
  } catch {
    // Vercel functions may reset or restrict local files. The seeded database is still usable for this request.
  }
  return database;
}

export async function loadDemoDatabase(path = defaultDemoDbPath()): Promise<DemoDatabase> {
  if (shouldUsePostgres()) return normalizeDemoDatabase(await loadPostgresDatabase());

  try {
    const raw = await readFile(path, "utf8");
    return normalizeDemoDatabase({ ...cloneEmptyDatabase(), ...JSON.parse(raw) } as DemoDatabase);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT" || error instanceof SyntaxError) return createRuntimeDemoDatabase(path);
    throw error;
  }
}

export async function saveDemoDatabase(database: DemoDatabase, path = defaultDemoDbPath()): Promise<void> {
  if (shouldUsePostgres()) {
    await savePostgresDatabase(normalizeDemoDatabase(database));
    return;
  }

  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
  await rename(temporaryPath, path);
}

export function assertSingleAdmin(users: UserRecord[]): void {
  const activeAdmins = users.filter((user) => user.role === "ADMIN" && !user.deletedAt);
  if (activeAdmins.length > 1) throw new Error("Only one active ADMIN is allowed");
}
