import { downloadRecruitmentAsset } from "@/lib/recruiting/download-asset";

export async function GET() {
  return downloadRecruitmentAsset("RECRUITING_GUIDE");
}
