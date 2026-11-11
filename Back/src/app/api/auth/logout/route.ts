import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth/session";
import { rejectCrossOriginMutation } from "@/lib/auth/csrf";

export async function POST(request: Request) {
  const csrf = rejectCrossOriginMutation(request);
  if (csrf) return csrf;
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  if ((request.headers.get("accept") ?? "").includes("text/html")) {
    return NextResponse.redirect(new URL("/", request.url), 303);
  }
  return NextResponse.json({ ok: true });
}
