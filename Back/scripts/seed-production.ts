import { randomUUID } from "node:crypto";
import { hashPassword } from "@/lib/auth/password";
import { query } from "@/lib/db/postgres";

const pageKeys = [
  "home",
  "about",
  "curriculum",
  "history",
  "reports",
  "report-detail",
  "alumni",
  "recruiting",
  "member-team",
  "interview-review",
  "auth",
  "admin",
];

if (!process.env.DATABASE_URL?.trim()) {
  throw new Error("DATABASE_URL is required. Set it before running npm run seed:production.");
}

const loginId = process.env.ADMIN_SEED_LOGIN_ID?.trim() || "admin";
const password = process.env.ADMIN_SEED_PASSWORD?.trim();
const adminName = process.env.ADMIN_SEED_NAME?.trim() || "관리자";

if (!password || password === "admin1234") {
  throw new Error("Set ADMIN_SEED_PASSWORD to a strong production-only password before running npm run seed:production.");
}

const existingAdmins = await query<{ id: string; login_id: string }>("SELECT id, login_id FROM users WHERE role = 'ADMIN' AND deleted_at IS NULL");
if (existingAdmins.length > 0 && existingAdmins.some((admin) => admin.login_id !== loginId)) {
  throw new Error(`An active admin already exists (${existingAdmins.map((admin) => admin.login_id).join(", ")}). Refusing to create another ADMIN.`);
}

const existingUsers = await query<{ id: string }>("SELECT id FROM users WHERE login_id = $1 LIMIT 1", [loginId]);
const now = new Date().toISOString();
const adminId = existingAdmins[0]?.id ?? existingUsers[0]?.id ?? process.env.ADMIN_SEED_USER_ID?.trim() ?? "user-admin";

await query(
  `INSERT INTO users (
    id, login_id, password_hash, name, role, approved_at, approved_by, rejected_at,
    rejected_by, rejection_reason, last_login_at, failed_login_count, locked_until,
    created_at, updated_at, deleted_at
  ) VALUES ($1, $2, $3, $4, 'ADMIN', $5, NULL, NULL, NULL, NULL, NULL, 0, NULL, $5, $5, NULL)
  ON CONFLICT (login_id) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = 'ADMIN',
    approved_at = COALESCE(users.approved_at, EXCLUDED.approved_at),
    rejected_at = NULL,
    rejected_by = NULL,
    rejection_reason = NULL,
    updated_at = EXCLUDED.updated_at,
    deleted_at = NULL`,
  [adminId, loginId, hashPassword(password), adminName, now],
);

for (const pageKey of pageKeys) {
  await query(
    `INSERT INTO banners (
      id, page_key, desktop_image_key, mobile_image_key, alt_text, overlay_opacity,
      object_position, updated_by, updated_at
    ) VALUES ($1, $2, $3, NULL, $4, 0.58, 'center center', $5, $6)
    ON CONFLICT (page_key) DO UPDATE SET
      alt_text = EXCLUDED.alt_text,
      updated_by = EXCLUDED.updated_by,
      updated_at = EXCLUDED.updated_at`,
    [`banner-${pageKey}`, pageKey, `images/banners/${pageKey}.png`, `HYFE ${pageKey} banner`, adminId, now],
  );
}

await query(
  `INSERT INTO audit_logs (
    id, actor_id, action, resource_type, resource_id, ip_address, user_agent, metadata, created_at
  ) VALUES ($1, $2, 'USER_APPROVED', 'seed', $2, NULL, 'seed-production', $3::jsonb, $4)`,
  [randomUUID(), adminId, JSON.stringify({ loginId, productionSeed: true }), now],
);

console.log(`Seeded production admin "${loginId}" and ${pageKeys.length} banner records.`);
