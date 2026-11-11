import Link from "next/link";
import { AccessNotice } from "@/components/auth/AccessNotice";
import { requireRole } from "@/lib/auth/session";
import { TEAM_ROUTE_CONFIG, type TeamSlug } from "@/lib/board-policy/team-routes";
import { getReadablePost, listAttachments } from "@/lib/db/post-repository";

export async function TeamDetailPage({ team, id }: { team: TeamSlug; id: string }) {
  let user: Awaited<ReturnType<typeof requireRole>>;
  try {
    user = await requireRole("MEMBER");
  } catch (error) {
    return <AccessNotice message={(error as Error).message} />;
  }
  const config = TEAM_ROUTE_CONFIG[team];
  const post = await getReadablePost({ id, expectedBoardType: config.boardType, actorRole: user.role });
  if (!post) return <main className="section container"><h1>자료를 찾을 수 없습니다.</h1></main>;
  const attachments = await listAttachments(id);
  const basePath = `/member/teams/${team}`;

  return (
    <main className="section">
      <div className="container articleShell">
        <div className="articleHead">
          <span className="tag">{config.koreanLabel}</span>
          <h2>{post.title}</h2>
          <div className="metaRow">
            <span>작성자 HYFE 팀</span>
            <span>작성일 {post.createdAt.slice(0, 10)}</span>
            <span>조회수 {post.viewCount}</span>
          </div>
        </div>
        <article className="summaryBox">
          <p className="muted">{post.content}</p>
        </article>
        <div className="actionRow">
          {attachments.map((attachment) => (
            <a className="button" href={`/api/attachments/${attachment.id}/download`} key={attachment.id}>
              {attachment.originalFilename} 다운로드
            </a>
          ))}
          <Link className="button secondary" href={`${basePath}/${id}/edit`}>
            수정
          </Link>
          <Link className="button secondary" href={basePath}>
            목록
          </Link>
        </div>
      </div>
    </main>
  );
}
