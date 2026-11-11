import { downloadRecruitmentAsset } from "@/lib/recruiting/download-asset";

export async function GET() {
  return downloadRecruitmentAsset("APPLICATION_FORM");
}
