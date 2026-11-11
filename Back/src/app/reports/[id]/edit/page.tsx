import { AccessNotice } from "@/components/auth/AccessNotice";
import { PostEditor } from "@/components/boards/PostEditor";
import { canEditPost } from "@/lib/authorization/roles";
import { requireRole } from "@/lib/auth/session";
import { REPORT_CATEGORY_OPTIONS, RECRUIT_CATEGORY_OPTIONS } from "@/lib/board-policy/post-categories";
import { getPost } from "@/lib/db/post-repository";

export const dynamic = "force-dynamic";

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
  let user: Awaited<ReturnType<typeof requireRole>>;
  try {
    user = await requireRole("ADMIN");
  } catch (error) {
    return <AccessNotice title="관리자 로그인이 필요합니다" message={(error as Error).message} />;
  }
  const { id } = await params;
  const post = await getPost(id);
  const editableBoard = post?.boardType === "PUBLIC_REPORT" || post?.boardType === "RECRUIT_MATERIAL";
  if (!post || !editableBoard || !canEditPost({ userId: user.id, userRole: user.role, postAuthorId: post.authorId })) {
    return (
      <main className="section container">
        <h1>자료를 찾을 수 없습니다.</h1>
      </main>
    );
  }
  const categoryOptions = post.boardType === "RECRUIT_MATERIAL" ? RECRUIT_CATEGORY_OPTIONS : REPORT_CATEGORY_OPTIONS;

  return (
    <main className="section">
      <div className="narrow">
        <div className="sectionHeader">
          <h2>공개 자료 수정</h2>
        </div>
        <PostEditor
          endpoint={`/api/posts/${id}`}
          initialTitle={post.title}
          initialContent={post.content}
          initialCategory={post.category}
          categoryOptions={categoryOptions}
        />
      </div>
    </main>
  );
}
