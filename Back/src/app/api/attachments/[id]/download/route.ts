import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getBoardPolicy } from "@/lib/board-policy/board-policy";
import { getAttachmentForDownload } from "@/lib/db/post-repository";
import { objectBodyToResponseBody, readObjectBody } from "@/lib/storage/object-storage";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getSessionUser();
  const actorRole = user?.role ?? "VISITOR";
  try {
    const { attachment, post } = await getAttachmentForDownload({ actorRole, actorId: user?.id ?? null, attachmentId: id });
    const policy = getBoardPolicy(post.boardType);
    if (policy.storage === "none") throw new Error("attachment storage unavailable");
    const body = await readObjectBody(policy.storage, attachment.storageKey);
    return new Response(objectBodyToResponseBody(body), { headers: { "content-type": attachment.mimeType, "content-disposition": `attachment; filename="${attachment.originalFilename}"` } });
  } catch (error) {
    return NextResponse.json({ ok: false, message: (error as Error).message }, { status: 403 });
  }
}
