import { randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { StoredRole } from "@/lib/authorization/roles";
import type { UserRecord } from "@/lib/db/schema";
import { assertSingleAdmin, loadDemoDatabase, saveDemoDatabase } from "@/lib/db/local-store";

const now = () => new Date().toISOString();

export async function listUsers(): Promise<UserRecord[]> {
  return (await loadDemoDatabase()).users;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  return (await loadDemoDatabase()).users.find((user) => user.id === id && !user.deletedAt) ?? null;
}

export async function getUserByLoginId(loginId: string): Promise<UserRecord | null> {
  return (await loadDemoDatabase()).users.find((user) => user.loginId === loginId && !user.deletedAt) ?? null;
}

export async function createPendingUser(input: { name: string; loginId: string; password: string }): Promise<UserRecord> {
  const db = await loadDemoDatabase();
  if (db.users.some((user) => user.loginId === input.loginId && !user.deletedAt)) throw new Error("loginId already exists");
  const user: UserRecord = {
    id: randomUUID(),
    loginId: input.loginId,
    passwordHash: hashPassword(input.password),
    name: input.name.trim(),
    role: "PENDING_USER",
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    lastLoginAt: null,
    failedLoginCount: 0,
    lockedUntil: null,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };
  db.users.push(user);
  assertSingleAdmin(db.users);
  await saveDemoDatabase(db);
  return user;
}

export async function verifyLogin(loginId: string, password: string): Promise<UserRecord | null> {
  const user = await getUserByLoginId(loginId);
  if (!user) return null;
  return verifyPassword(password, user.passwordHash) ? user : null;
}

export async function changeUserRole(params: { actorId: string; userId: string; role: StoredRole }): Promise<UserRecord> {
  const db = await loadDemoDatabase();
  const user = db.users.find((candidate) => candidate.id === params.userId && !candidate.deletedAt);
  if (!user) throw new Error("user not found");
  user.role = params.role;
  if (params.role !== "PENDING_USER" && !user.approvedAt) {
    user.approvedAt = now();
    user.approvedBy = params.actorId;
  }
  user.updatedAt = now();
  assertSingleAdmin(db.users);
  db.auditLogs.push({
    id: randomUUID(),
    actorId: params.actorId,
    action: params.role === "MEMBER" && !user.approvedAt ? "USER_APPROVED" : "ROLE_CHANGED",
    resourceType: "user",
    resourceId: user.id,
    ipAddress: null,
    userAgent: "local-demo",
    metadata: { role: params.role },
    createdAt: now(),
  });
  await saveDemoDatabase(db);
  return user;
}

export async function approveUser(params: { actorId: string; userId: string }): Promise<UserRecord> {
  const db = await loadDemoDatabase();
  const user = db.users.find((candidate) => candidate.id === params.userId && !candidate.deletedAt);
  if (!user) throw new Error("user not found");
  user.role = "MEMBER";
  user.approvedAt = now();
  user.approvedBy = params.actorId;
  user.updatedAt = now();
  assertSingleAdmin(db.users);
  db.auditLogs.push({
    id: randomUUID(),
    actorId: params.actorId,
    action: "USER_APPROVED",
    resourceType: "user",
    resourceId: user.id,
    ipAddress: null,
    userAgent: "local-demo",
    metadata: { role: "MEMBER" },
    createdAt: now(),
  });
  await saveDemoDatabase(db);
  return user;
}

export async function rejectUser(params: { actorId: string; userId: string; reason?: string | null }): Promise<UserRecord> {
  const db = await loadDemoDatabase();
  const user = db.users.find((candidate) => candidate.id === params.userId && !candidate.deletedAt);
  if (!user) throw new Error("user not found");
  if (user.role === "ADMIN") throw new Error("admin cannot be rejected");
  user.role = "PENDING_USER";
  user.rejectedAt = now();
  user.rejectedBy = params.actorId;
  user.rejectionReason = params.reason?.trim() || "관리자 반려";
  user.approvedAt = null;
  user.approvedBy = null;
  user.updatedAt = now();
  assertSingleAdmin(db.users);
  db.auditLogs.push({
    id: randomUUID(),
    actorId: params.actorId,
    action: "USER_REJECTED",
    resourceType: "user",
    resourceId: user.id,
    ipAddress: null,
    userAgent: "local-demo",
    metadata: { reason: user.rejectionReason },
    createdAt: now(),
  });
  await saveDemoDatabase(db);
  return user;
}
