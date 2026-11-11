import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  return NextResponse.json({ ok: true, user: await getSessionUser() });
}
