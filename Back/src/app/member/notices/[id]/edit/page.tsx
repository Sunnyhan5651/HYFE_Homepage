import { AccessNotice } from "@/components/auth/AccessNotice";
import { PostEditor } from "@/components/boards/PostEditor";
import { requireRole } from "@/lib/auth/session";
import { NOTICE_CATEGORY_OPTIONS } from "@/lib/board-policy/post-categories";
import { getEditablePost } from "@/lib/db/post-repository";

export const dynamic = "force-dynamic";

export default async function EditNoticePage({ params }: { params: Promise<{ id: string }> }) {
  let user: Awaited<ReturnType<typeof requireRole>>;
  try {
    user = await requireRole("MEMBER");
  } catch (error) {
    return <AccessNotice message={(error as Error).message} />;
  }
  const { id } = await params;
  const post = await getEditablePost({ id, expectedBoardType: "MEMBER_NOTICE", actor: { id: user.id, role: user.role } });
  if (!post) return <main className="section container"><h1>공지사항을 찾을 수 없습니다.</h1></main>;

  return (
    <main className="section">
      <div className="narrow">
        <div className="sectionHeader">
          <h2>공지 수정</h2>
        </div>
        <PostEditor
          endpoint={`/api/posts/${id}`}
          initialTitle={post.title}
          initialContent={post.content}
          initialCategory={post.category}
          categoryOptions={NOTICE_CATEGORY_OPTIONS}
          allowAttachments={false}
        />
      </div>
    </main>
  );
}
