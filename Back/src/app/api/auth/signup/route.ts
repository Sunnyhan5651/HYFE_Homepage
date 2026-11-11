import { NextResponse } from "next/server";
import { rejectCrossOriginMutation } from "@/lib/auth/csrf";
import { createPendingUser } from "@/lib/db/user-repository";
import { validateSignup, type SignupInput } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const csrf = rejectCrossOriginMutation(request);
  if (csrf) return csrf;
  const body = (await request.json()) as SignupInput & Record<string, unknown>;
  if ("team" in body || "user.team" in body) return NextResponse.json({ ok: false, message: "team field is not allowed" }, { status: 400 });
  const errors = validateSignup(body);
  if (errors.length) return NextResponse.json({ ok: false, errors }, { status: 400 });
  try {
    await createPendingUser(body);
    return NextResponse.json({ ok: true, message: "가입 신청이 완료되었습니다. 관리자 승인 후 이용 가능합니다." });
  } catch (error) {
    return NextResponse.json({ ok: false, message: (error as Error).message }, { status: 400 });
  }
}
