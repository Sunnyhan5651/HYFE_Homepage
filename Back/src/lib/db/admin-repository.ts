import { randomUUID } from "node:crypto";
import { loadDemoDatabase, saveDemoDatabase } from "@/lib/db/local-store";
import type { BannerRecord, RecruitmentAssetRecord, RecruitmentAssetType } from "@/lib/db/schema";
import { writeObject } from "@/lib/storage/object-storage";
import { sanitizeFilename, validateUpload } from "@/lib/storage/upload-validation";

const now = () => new Date().toISOString();

export async function updateBanner(params: {
  actorId: string;
  bannerId: string;
  altText?: string;
  overlayOpacity?: number;
}): Promise<BannerRecord> {
  const db = await loadDemoDatabase();
  const banner = db.banners.find((candidate) => candidate.id === params.bannerId);
  if (!banner) throw new Error("banner not found");

  if (typeof params.altText === "string" && params.altText.trim()) banner.altText = params.altText.trim();
  if (typeof params.overlayOpacity === "number" && Number.isFinite(params.overlayOpacity)) {
    banner.overlayOpacity = Math.min(0.9, Math.max(0, params.overlayOpacity));
  }
  banner.updatedBy = params.actorId;
  banner.updatedAt = now();
  db.auditLogs.push({
    id: randomUUID(),
    actorId: params.actorId,
    action: "BANNER_UPDATED",
    resourceType: "banner",
    resourceId: banner.id,
    ipAddress: null,
    userAgent: "local-demo",
    metadata: { pageKey: banner.pageKey },
    createdAt: now(),
  });
  await saveDemoDatabase(db);
  return banner;
}

export async function updateRecruitmentAsset(params: {
  actorId: string;
  assetId: string;
  isActive: boolean;
}): Promise<RecruitmentAssetRecord> {
  const db = await loadDemoDatabase();
  const asset = db.recruitmentAssets.find((candidate) => candidate.id === params.assetId);
  if (!asset) throw new Error("recruitment asset not found");

  if (params.isActive) {
    for (const candidate of db.recruitmentAssets) {
      if (candidate.assetType === asset.assetType && candidate.id !== asset.id) candidate.isActive = false;
    }
  }
  asset.isActive = params.isActive;
  asset.updatedAt = now();
  db.auditLogs.push({
    id: randomUUID(),
    actorId: params.actorId,
    action: "RECRUITMENT_ASSET_UPDATED",
    resourceType: "recruitment_asset",
    resourceId: asset.id,
    ipAddress: null,
    userAgent: "local-demo",
    metadata: { assetType: asset.assetType, isActive: asset.isActive },
    createdAt: now(),
  });
  await saveDemoDatabase(db);
  return asset;
}

function contentLength(contents: string | Uint8Array): number {
  return typeof contents === "string" ? Buffer.byteLength(contents) : contents.byteLength;
}

export async function recordRecruitmentAssetBlob(params: {
  actorId: string;
  assetType: RecruitmentAssetType;
  storageKey: string;
  filename: string;
  mimeType: string;
  fileSize: number;
}): Promise<RecruitmentAssetRecord> {
  const validation = validateUpload({ filename: params.filename, fileSize: params.fileSize });
  if (!validation.ok) throw new Error(validation.reason);

  const prefix = `recruiting/${params.assetType.toLowerCase()}/`;
  if (!params.storageKey.startsWith(prefix)) throw new Error("invalid recruitment asset storage key");

  const cleanFilename = sanitizeFilename(params.filename);
  const db = await loadDemoDatabase();
  for (const candidate of db.recruitmentAssets) {
    if (candidate.assetType === params.assetType) candidate.isActive = false;
  }

  let asset = db.recruitmentAssets.find((candidate) => candidate.storageKey === params.storageKey);
  if (asset) {
    asset.assetType = params.assetType;
    asset.originalFilename = cleanFilename;
    asset.mimeType = params.mimeType;
    asset.fileSize = params.fileSize;
    asset.isActive = true;
    asset.uploadedBy = params.actorId;
    asset.updatedAt = now();
  } else {
    asset = {
      id: randomUUID(),
      assetType: params.assetType,
      storageKey: params.storageKey,
      originalFilename: cleanFilename,
      mimeType: params.mimeType,
      fileSize: params.fileSize,
      downloadCount: 0,
      isActive: true,
      uploadedBy: params.actorId,
      createdAt: now(),
      updatedAt: now(),
    };
    db.recruitmentAssets.push(asset);
  }

  db.auditLogs.push({
    id: randomUUID(),
    actorId: params.actorId,
    action: "RECRUITMENT_ASSET_UPDATED",
    resourceType: "recruitment_asset",
    resourceId: asset.id,
    ipAddress: null,
    userAgent: "local-demo",
    metadata: { assetType: asset.assetType, filename: asset.originalFilename },
    createdAt: now(),
  });
  await saveDemoDatabase(db);
  return asset;
}

export async function replaceRecruitmentAsset(params: {
  actorId: string;
  assetType: RecruitmentAssetType;
  filename: string;
  mimeType: string;
  contents: string | Uint8Array;
  fileSize?: number;
}): Promise<RecruitmentAssetRecord> {
  const size = params.fileSize ?? contentLength(params.contents);
  const validation = validateUpload({ filename: params.filename, fileSize: size });
  if (!validation.ok) throw new Error(validation.reason);

  const cleanFilename = sanitizeFilename(params.filename);
  const storageKey = `recruiting/${params.assetType.toLowerCase()}/${randomUUID()}-${cleanFilename}`;
  await writeObject("public", storageKey, params.contents);
  return recordRecruitmentAssetBlob({
    actorId: params.actorId,
    assetType: params.assetType,
    storageKey,
    filename: cleanFilename,
    mimeType: params.mimeType,
    fileSize: size,
  });
}
