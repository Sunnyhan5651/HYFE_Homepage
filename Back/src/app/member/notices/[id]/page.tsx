import Link from "next/link";
import { AccessNotice } from "@/components/auth/AccessNotice";
import { categoryLabel } from "@/lib/board-policy/post-categories";
import { requireRole } from "@/lib/auth/session";
import { getReadablePost } from "@/lib/db/post-repository";

export const dynamic = "force-dynamic";

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  let user: Awaited<ReturnType<typeof requireRole>>;
  try {
    user = await requireRole("MEMBER");
  } catch (error) {
    return <AccessNotice message={(error as Error).message} />;
  }
  const { id } = await params;
  const post = await getReadablePost({ id, expectedBoardType: "MEMBER_NOTICE", actorRole: user.role });
  if (!post) return <main className="section container"><h1>공지사항을 찾을 수 없습니다.</h1></main>;

  return (
    <main className="section">
      <div className="container articleShell">
        <div className="articleHead">
          <span className="tag">{categoryLabel(post.category, "공지")}</span>
          <h2>{post.title}</h2>
          <div className="metaRow">
            <span>작성일 {post.createdAt.slice(0, 10)}</span>
          </div>
        </div>
        <article className="summaryBox">
          <p className="muted">{post.content}</p>
        </article>
        <div className="actionRow">
          {user.role === "ADMIN" ? (
            <Link className="button secondary" href={`/member/notices/${id}/edit`}>
              수정
            </Link>
          ) : null}
          <Link className="button secondary" href="/member/notices">
            목록
          </Link>
        </div>
      </div>
    </main>
  );
}
