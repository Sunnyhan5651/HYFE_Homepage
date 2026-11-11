import { NextResponse } from "next/server";
import { rejectCrossOriginMutation } from "@/lib/auth/csrf";
import { getSessionUser } from "@/lib/auth/session";
import { hasRoleAtLeast } from "@/lib/authorization/roles";
import { createPost, listPosts } from "@/lib/db/post-repository";
import { teamConfig } from "@/lib/board-policy/team-routes";

export async function GET(request: Request, context: { params: Promise<{ team: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, message: "회원 전용 페이지입니다. 로그인 후 이용해 주세요." }, { status: 401 });
  if (!hasRoleAtLeast(user.role, "MEMBER")) return NextResponse.json({ ok: false, message: "접근 권한이 없습니다." }, { status: 403 });
  const { team } = await context.params;
  const url = new URL(request.url);
  return NextResponse.json({
    ok: true,
    posts: await listPosts(teamConfig(team).boardType, {
      category: url.searchParams.get("category"),
      q: url.searchParams.get("q"),
    }),
  });
}

export async function POST(request: Request, context: { params: Promise<{ team: string }> }) {
  const csrf = rejectCrossOriginMutation(request);
  if (csrf) return csrf;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, message: "회원 전용 페이지입니다. 로그인 후 이용해 주세요." }, { status: 401 });
  if (!hasRoleAtLeast(user.role, "MEMBER")) return NextResponse.json({ ok: false, message: "접근 권한이 없습니다." }, { status: 403 });
  const { team } = await context.params;
  try {
    const post = await createPost({ actor: { id: user.id, role: user.role }, boardType: teamConfig(team).boardType, payload: await request.json() });
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    return NextResponse.json({ ok: false, message: (error as Error).message }, { status: 400 });
  }
}
