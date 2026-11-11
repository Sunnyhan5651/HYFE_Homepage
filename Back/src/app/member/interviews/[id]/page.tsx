import Link from "next/link";
import { AccessNotice } from "@/components/auth/AccessNotice";
import { InterviewProtected } from "@/components/interview/InterviewProtected";
import { categoryLabel } from "@/lib/board-policy/post-categories";
import { requireRole } from "@/lib/auth/session";
import { getReadablePost, recordInterviewViewed } from "@/lib/db/post-repository";

export const dynamic = "force-dynamic";

export default async function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  let user: Awaited<ReturnType<typeof requireRole>>;
  try {
    user = await requireRole("INTERVIEW_REVIEWER");
  } catch (error) {
    return <AccessNotice message={(error as Error).message} />;
  }
  const { id } = await params;
  const post = await getReadablePost({ id, expectedBoardType: "INTERVIEW_REVIEW", actorRole: user.role });
  if (!post) return <main className="section container"><h1>후기를 찾을 수 없습니다.</h1></main>;
  await recordInterviewViewed({ actorId: user.id, postId: id });

  return (
    <main className="section">
      <div className="container articleShell">
        <InterviewProtected watermark={`${user.name} / ${user.loginId} / local-demo`}>
          <div className="articleHead">
            <span className="tag">회원</span>
            <h2>{post.title}</h2>
            <div className="metaRow">
              <span>직무 {categoryLabel(post.category, "미지정")}</span>
              <span>회사 유형 {categoryLabel(post.companyType, "미지정")}</span>
              <span>작성일 {post.createdAt.slice(0, 10)}</span>
              <span>조회수 {post.viewCount}</span>
            </div>
          </div>
          <div className="summaryBox">
            <p className="muted">{post.content}</p>
          </div>
        </InterviewProtected>
        <div className="actionRow">
          <Link className="button secondary" href={`/member/interviews/${id}/edit`}>
            수정
          </Link>
          <Link className="button secondary" href="/member/interviews">
            목록
          </Link>
        </div>
      </div>
    </main>
  );
}
