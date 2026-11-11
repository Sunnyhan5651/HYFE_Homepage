import { AccessNotice } from "@/components/auth/AccessNotice";
import { PostEditor } from "@/components/boards/PostEditor";
import { INTERVIEW_CATEGORY_OPTIONS, INTERVIEW_COMPANY_TYPE_OPTIONS } from "@/lib/board-policy/post-categories";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewInterviewPage() {
  try {
    await requireRole("INTERVIEW_REVIEWER");
  } catch (error) {
    return <AccessNotice message={(error as Error).message} />;
  }
  return (
    <main className="section">
      <div className="narrow">
        <div className="sectionHeader">
          <h2>면접 후기 작성</h2>
          <p className="sectionLead">외부 공유가 가능한 범위에서 전형 흐름과 준비 포인트를 작성해 주세요.</p>
        </div>
        <PostEditor
          endpoint="/api/member/interviews"
          categoryOptions={INTERVIEW_CATEGORY_OPTIONS}
          categoryLabel="직무"
          companyTypeOptions={INTERVIEW_COMPANY_TYPE_OPTIONS}
          initialCategory="research"
          initialCompanyType="securities-firm"
          allowAttachments={false}
        />
      </div>
    </main>
  );
}
