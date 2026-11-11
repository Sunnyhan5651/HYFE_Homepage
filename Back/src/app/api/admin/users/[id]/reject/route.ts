import { NextResponse } from "next/server";
import { rejectCrossOriginMutation } from "@/lib/auth/csrf";
import { getSessionUser } from "@/lib/auth/session";
import { hasRoleAtLeast } from "@/lib/authorization/roles";
import { rejectUser } from "@/lib/db/user-repository";
import { readRequestFields } from "@/lib/http/request-body";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const csrf = rejectCrossOriginMutation(request);
  if (csrf) return csrf;
  const actor = await getSessionUser();
  if (!actor || !hasRoleAtLeast(actor.role, "ADMIN")) return NextResponse.json({ ok: false, message: "접근 권한이 없습니다." }, { status: 403 });
  const { id } = await context.params;
  const body = await readRequestFields(request);
  const user = await rejectUser({ actorId: actor.id, userId: id, reason: body.reason });
  if ((request.headers.get("accept") ?? "").includes("text/html")) {
    return NextResponse.redirect(new URL("/admin/users", request.url), 303);
  }
  return NextResponse.json({ ok: true, user: { id: user.id, role: user.role, rejectedAt: user.rejectedAt } });
}
