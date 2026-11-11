import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth/session";
import { rejectCrossOriginMutation } from "@/lib/auth/csrf";
import { createSessionToken } from "@/lib/auth/session-token";
import { verifyLogin } from "@/lib/db/user-repository";

export async function POST(request: Request) {
  const csrf = rejectCrossOriginMutation(request);
  if (csrf) return csrf;
  const body = (await request.json()) as { loginId?: string; password?: string };
  const user = body.loginId && body.password ? await verifyLogin(body.loginId, body.password) : null;
  if (!user) return NextResponse.json({ ok: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  const jar = await cookies();
  jar.set(COOKIE_NAME, createSessionToken(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60,
  });
  return NextResponse.json({ ok: true, user: { id: user.id, loginId: user.loginId, name: user.name, role: user.role } });
}
