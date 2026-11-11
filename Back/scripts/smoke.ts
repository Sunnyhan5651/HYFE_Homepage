import { existsSync } from "node:fs";
import { loadDemoDatabase } from "@/lib/db/local-store";
import { PUBLIC_ROUTES } from "@/lib/navigation/site-map";
import { BOARD_POLICY } from "@/lib/board-policy/board-policy";

const requiredFiles = [
  "src/app/page.tsx",
  "src/app/member/interviews/page.tsx",
  "src/app/admin/audit-logs/page.tsx",
  "src/lib/authorization/roles.ts",
  "src/lib/board-policy/board-policy.ts",
  "src/lib/db/post-repository.ts",
  "src/lib/storage/local-storage.ts",
];

for (const file of requiredFiles) {
  if (!existsSync(file)) throw new Error(`missing smoke file: ${file}`);
}

if (PUBLIC_ROUTES.some((route) => route.startsWith("/member") || route.startsWith("/admin"))) {
  throw new Error("PUBLIC_ROUTES must exclude private routes");
}

if (BOARD_POLICY.INTERVIEW_REVIEW.allowAttachments) throw new Error("interview attachments must stay disabled");
if (BOARD_POLICY.TEAM_IB_OUTPUT.storage !== "private") throw new Error("team storage must stay private");
if (BOARD_POLICY.PUBLIC_REPORT.storage !== "public") throw new Error("public report storage must stay public");

const db = await loadDemoDatabase();
const roles = new Set(db.users.map((user) => user.role));
for (const role of ["ADMIN", "PENDING_USER", "MEMBER", "INTERVIEW_REVIEWER"]) {
  if (!roles.has(role as never)) throw new Error(`missing seeded role: ${role}`);
}

if (!db.auditLogs.every((log) => !("updatedAt" in log) && !("deletedAt" in log))) {
  throw new Error("audit logs must remain append-only records without update/delete fields");
}

console.log("Smoke PASS: routes, policy invariants, seed roles, and audit append-only shape verified.");
