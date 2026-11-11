import Link from "next/link";
import { SubNavigation } from "@/components/navigation/SubNavigation";
import { SubHero } from "@/components/sections/SubHero";
import { getSessionUser } from "@/lib/auth/session";
import { categoryLabel } from "@/lib/board-policy/post-categories";
import { banners, recruitingTabs, reportTabs, withActive } from "@/lib/content/site-content";
import { getPublicReadablePost, listAttachments } from "@/lib/db/post-repository";

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPublicReadablePost(id);
  if (!post) return <main className="section container"><h1>자료를 찾을 수 없습니다.</h1></main>;
  const attachments = await listAttachments(id);
  const user = await getSessionUser();
  const isRecruiting = post.boardType === "RECRUIT_MATERIAL";
  const isMarket = post.boardType.startsWith("TEAM_");
  const listHref = isRecruiting ? "/reports/recruiting" : isMarket ? "/reports?category=market" : "/reports";
  const label = isMarket ? "시황" : categoryLabel(post.category, "자료");

  return (
    <main>
      <SubHero
        title={isRecruiting ? "RECRUITING" : "REPORTS"}
        subtitle={isRecruiting ? "리크루팅 자료 상세" : isMarket ? "시황 자료 상세" : "리서치 리포트 상세"}
        image={isRecruiting ? banners.recruiting : banners.reportDetail}
        parent={isRecruiting ? "Recruiting" : "Reports"}
        current="상세보기"
      />
      <SubNavigation
        section={isRecruiting ? "RECRUITING" : "REPORTS"}
        links={withActive(isRecruiting ? recruitingTabs : reportTabs, isRecruiting ? "/recruiting#materials" : "/reports")}
      />

      <section className="section">
        <div className="container articleShell">
          <div className="articleHead">
            <span className="tag">{label}</span>
            <h2>{post.title}</h2>
            <div className="metaRow">
              <span>작성일 {post.createdAt.slice(0, 10)}</span>
              <span>첨부파일 {attachments.length}개</span>
            </div>
            <div className="actionRow">
              <Link className="button secondary" href={listHref}>
                목록
              </Link>
            </div>
          </div>

          <div className="summaryBox">
            <h3>내용</h3>
            <p className="muted">{post.content}</p>
          </div>

          {attachments.length ? (
            <div className="summaryBox">
              <h3>첨부파일</h3>
              <div className="actionRow">
                {attachments.map((attachment) => (
                  <a className="button" href={`/api/attachments/${attachment.id}/download`} key={attachment.id}>
                    {attachment.originalFilename} 다운로드
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div className="metaRow">
            <Link className="button secondary" href={listHref}>
              목록으로
            </Link>
            {user?.role === "ADMIN" && (post.boardType === "PUBLIC_REPORT" || post.boardType === "RECRUIT_MATERIAL") ? (
              <Link className="button secondary" href={`/reports/${id}/edit`}>
                수정
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
