import { NextResponse } from "next/server";

export function rejectCrossOriginMutation(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return null;

  try {
    if (new URL(origin).host === host) return null;
  } catch {
    // Fall through to the rejection below.
  }

  return NextResponse.json({ ok: false, message: "Cross-origin mutation is not allowed in the local demo." }, { status: 403 });
}

