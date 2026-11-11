import { NextResponse } from "next/server";
import { rejectCrossOriginMutation } from "@/lib/auth/csrf";
import { getSessionUser } from "@/lib/auth/session";
import { recordAttachmentBlob } from "@/lib/db/post-repository";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const csrf = rejectCrossOriginMutation(request);
  if (csrf) return csrf;

  const actor = await getSessionUser();
  if (!actor) {
    return NextResponse.json({ ok: false, message: "회원 전용 페이지입니다. 로그인 후 이용해주세요." }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    if (typeof body.storageKey !== "string") throw new Error("invalid storage key");
    if (typeof body.filename !== "string") throw new Error("invalid filename");
    const fileSize = Number(body.fileSize);
    if (!Number.isFinite(fileSize)) throw new Error("invalid file size");

    const attachment = await recordAttachmentBlob({
      actor: { id: actor.id, role: actor.role },
      postId: id,
      storageKey: body.storageKey,
      filename: body.filename,
      mimeType: typeof body.mimeType === "string" && body.mimeType ? body.mimeType : "application/octet-stream",
      fileSize,
    });
    return NextResponse.json({ ok: true, attachment });
  } catch (error) {
    return NextResponse.json({ ok: false, message: (error as Error).message }, { status: 400 });
  }
}
