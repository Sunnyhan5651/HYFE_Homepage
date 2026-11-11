import { AccessNotice } from "@/components/auth/AccessNotice";
import { PostEditor } from "@/components/boards/PostEditor";
import { requireRole } from "@/lib/auth/session";
import { REPORT_CATEGORY_OPTIONS } from "@/lib/board-policy/post-categories";

export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  try {
    await requireRole("ADMIN");
  } catch (error) {
    return <AccessNotice title="관리자 로그인이 필요합니다" message={(error as Error).message} />;
  }

  return (
    <main className="section">
      <div className="narrow">
        <div className="sectionHeader">
          <h2>공개 레포트 작성</h2>
          <p className="sectionLead">관리자 계정으로만 공개 게시판 자료를 등록할 수 있습니다.</p>
        </div>
        <PostEditor endpoint="/api/reports" categoryOptions={REPORT_CATEGORY_OPTIONS} initialCategory="corporate" />
      </div>
    </main>
  );
}
