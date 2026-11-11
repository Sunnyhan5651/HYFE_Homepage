import { AccessNotice } from "@/components/auth/AccessNotice";
import { PostEditor } from "@/components/boards/PostEditor";
import { requireRole } from "@/lib/auth/session";
import { NOTICE_CATEGORY_OPTIONS } from "@/lib/board-policy/post-categories";

export const dynamic = "force-dynamic";

export default async function NewNoticePage() {
  try {
    await requireRole("MEMBER");
  } catch (error) {
    return <AccessNotice message={(error as Error).message} />;
  }

  return (
    <main className="section">
      <div className="narrow">
        <div className="sectionHeader">
          <h2>공지 작성</h2>
          <p className="sectionLead">팀 게시판과 분리된 회원 전용 공지를 등록합니다.</p>
        </div>
        <PostEditor endpoint="/api/member/notices" categoryOptions={NOTICE_CATEGORY_OPTIONS} initialCategory="general" allowAttachments={false} />
      </div>
    </main>
  );
}
