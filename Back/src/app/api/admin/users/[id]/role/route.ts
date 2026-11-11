import { NextResponse } from "next/server";
import { rejectCrossOriginMutation } from "@/lib/auth/csrf";
import { getSessionUser } from "@/lib/auth/session";
import { hasRoleAtLeast, isStoredRole, type Role, type StoredRole } from "@/lib/authorization/roles";
import { changeUserRole } from "@/lib/db/user-repository";
import { readRequestFields } from "@/lib/http/request-body";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const csrf = rejectCrossOriginMutation(request);
  if (csrf) return csrf;
  const actor = await getSessionUser();
  if (!actor || !hasRoleAtLeast(actor.role, "ADMIN")) return NextResponse.json({ ok: false, message: "접근 권한이 없습니다." }, { status: 403 });
  const body = await readRequestFields(request);
  const role = body.role as Role;
  if (!isStoredRole(role)) return NextResponse.json({ ok: false, message: "올바르지 않은 role입니다." }, { status: 400 });
  const { id } = await context.params;
  const user = await changeUserRole({ actorId: actor.id, userId: id, role: role as StoredRole });
  if ((request.headers.get("accept") ?? "").includes("text/html")) {
    return NextResponse.redirect(new URL("/admin/users", request.url), 303);
  }
  return NextResponse.json({ ok: true, user: { id: user.id, role: user.role, approvedAt: user.approvedAt } });
}
