import { NextResponse } from "next/server";
import { rejectCrossOriginMutation } from "@/lib/auth/csrf";
import { getSessionUser } from "@/lib/auth/session";
import { deletePost, getPost, updatePost } from "@/lib/db/post-repository";
import { canReadBoard } from "@/lib/board-policy/board-policy";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const post = await getPost(id);
  if (!post) return NextResponse.json({ ok: false, message: "post not found" }, { status: 404 });
  const user = await getSessionUser();
  if (!canReadBoard(post.boardType, user?.role ?? "VISITOR")) return NextResponse.json({ ok: false, message: "접근 권한이 없습니다." }, { status: 403 });
  return NextResponse.json({ ok: true, post });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const csrf = rejectCrossOriginMutation(request);
  if (csrf) return csrf;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, message: "회원 전용 페이지입니다. 로그인 후 이용해 주세요." }, { status: 401 });
  const { id } = await context.params;
  try {
    return NextResponse.json({ ok: true, post: await updatePost({ actor: { id: user.id, role: user.role }, id, payload: await request.json() }) });
  } catch (error) {
    return NextResponse.json({ ok: false, message: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const csrf = rejectCrossOriginMutation(request);
  if (csrf) return csrf;
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, message: "회원 전용 페이지입니다. 로그인 후 이용해 주세요." }, { status: 401 });
  const { id } = await context.params;
  await deletePost({ actor: { id: user.id, role: user.role }, id });
  return NextResponse.json({ ok: true });
}
