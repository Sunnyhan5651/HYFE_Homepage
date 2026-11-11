import type { RecruitmentAssetType } from "@/lib/db/schema";

export const RECRUITMENT_ASSET_TYPES = ["APPLICATION_FORM", "RECRUITING_GUIDE"] as const satisfies readonly RecruitmentAssetType[];

export const RECRUITMENT_ASSET_CONFIG = {
  APPLICATION_FORM: {
    label: "지원서",
    downloadLabel: "지원서 다운로드",
    downloadPath: "/api/recruiting/application/download",
  },
  RECRUITING_GUIDE: {
    label: "학회 안내자료",
    downloadLabel: "안내자료 다운로드",
    downloadPath: "/api/recruiting/guide/download",
  },
} as const satisfies Record<RecruitmentAssetType, { label: string; downloadLabel: string; downloadPath: string }>;

export function isRecruitmentAssetType(value: unknown): value is RecruitmentAssetType {
  return typeof value === "string" && RECRUITMENT_ASSET_TYPES.includes(value as RecruitmentAssetType);
}

export function activeRecruitmentAsset<T extends { assetType: RecruitmentAssetType; isActive: boolean }>(
  assets: T[],
  assetType: RecruitmentAssetType,
): T | null {
  return assets.find((asset) => asset.assetType === assetType && asset.isActive) ?? null;
}
