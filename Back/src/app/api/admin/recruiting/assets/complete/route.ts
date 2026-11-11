import { NextResponse } from "next/server";
import { rejectCrossOriginMutation } from "@/lib/auth/csrf";
import { getSessionUser } from "@/lib/auth/session";
import { hasRoleAtLeast } from "@/lib/authorization/roles";
import { recordRecruitmentAssetBlob } from "@/lib/db/admin-repository";
import { isRecruitmentAssetType } from "@/lib/recruiting/assets";

export async function POST(request: Request) {
  const csrf = rejectCrossOriginMutation(request);
  if (csrf) return csrf;

  const actor = await getSessionUser();
  if (!actor || !hasRoleAtLeast(actor.role, "ADMIN")) {
    return NextResponse.json({ ok: false, message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (!isRecruitmentAssetType(body.assetType)) throw new Error("invalid recruitment asset type");
    if (typeof body.storageKey !== "string") throw new Error("invalid storage key");
    if (typeof body.filename !== "string") throw new Error("invalid filename");
    const fileSize = Number(body.fileSize);
    if (!Number.isFinite(fileSize)) throw new Error("invalid file size");

    const asset = await recordRecruitmentAssetBlob({
      actorId: actor.id,
      assetType: body.assetType,
      storageKey: body.storageKey,
      filename: body.filename,
      mimeType: typeof body.mimeType === "string" && body.mimeType ? body.mimeType : "application/octet-stream",
      fileSize,
    });
    return NextResponse.json({ ok: true, asset });
  } catch (error) {
    return NextResponse.json({ ok: false, message: (error as Error).message }, { status: 400 });
  }
}
