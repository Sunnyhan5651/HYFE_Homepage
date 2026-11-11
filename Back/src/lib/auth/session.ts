import { cookies } from "next/headers";
import type { UserRecord } from "@/lib/db/schema";
import { getUserById } from "@/lib/db/user-repository";
import { hasRoleAtLeast, type Role } from "@/lib/authorization/roles";
import { verifySessionToken } from "@/lib/auth/session-token";

export const COOKIE_NAME = process.env.COOKIE_NAME ?? "hyfe_demo_session";

export type SessionUser = Pick<UserRecord, "id" | "loginId" | "name" | "role">;

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  const userId = token ? verifySessionToken(token) : null;
  if (!userId) return null;
  const user = await getUserById(userId);
  if (!user || user.deletedAt) return null;
  return { id: user.id, loginId: user.loginId, name: user.name, role: user.role };
}

export async function requireRole(requiredRole: Role): Promise<SessionUser> {
  const user = await getSessionUser();
  const role = user?.role ?? "VISITOR";
  if (role === "VISITOR") throw new Error("회원 전용 페이지입니다. 로그인 후 이용해 주세요.");
  if (role === "PENDING_USER") throw new Error("관리자 승인 후 이용 가능합니다.");
  if (!hasRoleAtLeast(role, requiredRole)) throw new Error("접근 권한이 없습니다.");
  return user!;
}
