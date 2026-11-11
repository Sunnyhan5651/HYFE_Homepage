import { AccessNotice } from "@/components/auth/AccessNotice";
import { PostEditor } from "@/components/boards/PostEditor";
import { INTERVIEW_CATEGORY_OPTIONS, INTERVIEW_COMPANY_TYPE_OPTIONS } from "@/lib/board-policy/post-categories";
import { requireRole } from "@/lib/auth/session";
import { getEditablePost } from "@/lib/db/post-repository";

export const dynamic = "force-dynamic";

export default async function EditInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  let user: Awaited<ReturnType<typeof requireRole>>;
  try {
    user = await requireRole("INTERVIEW_REVIEWER");
  } catch (error) {
    return <AccessNotice message={(error as Error).message} />;
  }
  const { id } = await params;
  const post = await getEditablePost({ id, expectedBoardType: "INTERVIEW_REVIEW", actor: { id: user.id, role: user.role } });
  if (!post) return <main className="section container"><h1>후기를 찾을 수 없습니다.</h1></main>;

  return (
    <main className="section">
      <div className="narrow">
        <div className="sectionHeader">
          <h2>면접 후기 수정</h2>
        </div>
        <PostEditor
          endpoint={`/api/posts/${id}`}
          initialTitle={post.title}
          initialContent={post.content}
          initialCategory={post.category}
          initialCompanyType={post.companyType}
          categoryOptions={INTERVIEW_CATEGORY_OPTIONS}
          categoryLabel="직무"
          companyTypeOptions={INTERVIEW_COMPANY_TYPE_OPTIONS}
          allowAttachments={false}
        />
      </div>
    </main>
  );
}
