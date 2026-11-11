import { NextResponse } from "next/server";
import { rejectCrossOriginMutation } from "@/lib/auth/csrf";
import { getSessionUser } from "@/lib/auth/session";
import { hasRoleAtLeast } from "@/lib/authorization/roles";
import { deletePost } from "@/lib/db/post-repository";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const csrf = rejectCrossOriginMutation(request);
  if (csrf) return csrf;
  const actor = await getSessionUser();
  if (!actor || !hasRoleAtLeast(actor.role, "ADMIN")) return NextResponse.json({ ok: false, message: "접근 권한이 없습니다." }, { status: 403 });
  const { id } = await context.params;
  await deletePost({ actor: { id: actor.id, role: actor.role }, id });
  if ((request.headers.get("accept") ?? "").includes("text/html")) {
    return NextResponse.redirect(new URL("/admin/posts", request.url), 303);
  }
  return NextResponse.json({ ok: true });
}
