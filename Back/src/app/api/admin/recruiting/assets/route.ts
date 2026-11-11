import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSessionUser } from "@/lib/auth/session";
import { hasRoleAtLeast } from "@/lib/authorization/roles";
import { recordRecruitmentAssetBlob } from "@/lib/db/admin-repository";
import { isRecruitmentAssetType } from "@/lib/recruiting/assets";
import { validateUpload } from "@/lib/storage/upload-validation";

type UploadPayload = {
  actorId?: unknown;
  assetType: unknown;
  filename: unknown;
  fileSize: unknown;
  mimeType: unknown;
};

function parseClientPayload(payload: string | null): UploadPayload {
  if (!payload) throw new Error("missing upload metadata");
  return JSON.parse(payload) as UploadPayload;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const actor = await getSessionUser();
        if (!actor || !hasRoleAtLeast(actor.role, "ADMIN")) throw new Error("관리자 권한이 필요합니다.");

        const payload = parseClientPayload(clientPayload);
        if (!isRecruitmentAssetType(payload.assetType)) throw new Error("invalid recruitment asset type");
        if (typeof payload.filename !== "string") throw new Error("invalid filename");
        const fileSize = Number(payload.fileSize);
        if (!Number.isFinite(fileSize)) throw new Error("invalid file size");
        const validation = validateUpload({ filename: payload.filename, fileSize });
        if (!validation.ok) throw new Error(validation.reason);

        const prefix = `recruiting/${payload.assetType.toLowerCase()}/`;
        if (!pathname.startsWith(prefix)) throw new Error("invalid upload pathname");

        return {
          addRandomSuffix: false,
          allowOverwrite: false,
          maximumSizeInBytes: fileSize,
          tokenPayload: JSON.stringify({
            actorId: actor.id,
            assetType: payload.assetType,
            filename: payload.filename,
            fileSize,
            mimeType: typeof payload.mimeType === "string" && payload.mimeType ? payload.mimeType : "application/octet-stream",
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = parseClientPayload(tokenPayload ?? null);
        if (!isRecruitmentAssetType(payload.assetType)) throw new Error("invalid recruitment asset type");
        if (typeof payload.actorId !== "string") throw new Error("invalid actor");
        if (typeof payload.filename !== "string") throw new Error("invalid filename");
        const fileSize = Number(payload.fileSize);
        if (!Number.isFinite(fileSize)) throw new Error("invalid file size");

        await recordRecruitmentAssetBlob({
          actorId: payload.actorId,
          assetType: payload.assetType,
          storageKey: blob.pathname,
          filename: payload.filename,
          mimeType: typeof payload.mimeType === "string" && payload.mimeType ? payload.mimeType : blob.contentType,
          fileSize,
        });
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
