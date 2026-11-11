import { loadDemoDatabase, saveDemoDatabase } from "@/lib/db/local-store";
import type { RecruitmentAssetType } from "@/lib/db/schema";
import { objectBodyToResponseBody, readObjectBody, type ObjectBody } from "@/lib/storage/object-storage";

export async function downloadRecruitmentAsset(assetType: RecruitmentAssetType): Promise<Response> {
  const db = await loadDemoDatabase();
  const asset = db.recruitmentAssets.find((candidate) => candidate.assetType === assetType && candidate.isActive);
  if (!asset) return new Response("active recruitment asset not found", { status: 404 });

  let body: ObjectBody;
  try {
    body = await readObjectBody("public", asset.storageKey);
  } catch {
    return new Response("recruitment asset file not found", { status: 404 });
  }

  asset.downloadCount += 1;
  asset.updatedAt = new Date().toISOString();
  await saveDemoDatabase(db);

  const encodedFilename = encodeURIComponent(asset.originalFilename);
  return new Response(objectBodyToResponseBody(body), {
    headers: {
      "content-type": asset.mimeType,
      "content-disposition": `attachment; filename="download"; filename*=UTF-8''${encodedFilename}`,
    },
  });
}
