import Link from "next/link";
import { AccessNotice } from "@/components/auth/AccessNotice";
import { BoardList, BoardTools, Pagination } from "@/components/boards/BoardList";
import { InterviewProtected } from "@/components/interview/InterviewProtected";
import { SubNavigation } from "@/components/navigation/SubNavigation";
import { SubHero } from "@/components/sections/SubHero";
import { requireRole } from "@/lib/auth/session";
import { INTERVIEW_CATEGORY_OPTIONS, INTERVIEW_COMPANY_TYPE_OPTIONS, categoryLabel } from "@/lib/board-policy/post-categories";
import { banners, memberTabs, withActive } from "@/lib/content/site-content";
import { listPaginatedPosts } from "@/lib/db/post-repository";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function pageParam(value: string | string[] | undefined): number {
  const page = Number(firstParam(value));
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function buildHref(params: { q?: string; category?: string; companyType?: string }, page: number): string {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.companyType) query.set("companyType", params.companyType);
  if (params.q) query.set("q", params.q);
  if (page > 1) query.set("page", String(page));
  const suffix = query.toString();
  return suffix ? `/member/interviews?${suffix}` : "/member/interviews";
}

export default async function InterviewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  let user: Awaited<ReturnType<typeof requireRole>>;
  try {
    user = await requireRole("INTERVIEW_REVIEWER");
  } catch (error) {
    return <AccessNotice message={(error as Error).message} />;
  }
  const params = await searchParams;
  const q = firstParam(params.q).trim();
  const category = firstParam(params.category).trim();
  const companyType = firstParam(params.companyType).trim();
  const page = pageParam(params.page);
  const result = await listPaginatedPosts({ boardType: "INTERVIEW_REVIEW", category, companyType, q, page, pageSize: 6 });

  return (
    <main>
      <SubHero
        title="MEMBER"
        subtitle="커리어 경험과 면접 후기를 안전하게 공유합니다."
        image={banners.interviewReview}
        parent="Member"
        current="면접 후기"
      />
      <SubNavigation section="MEMBER" links={withActive(memberTabs, "/member/interviews")} />

      <section className="section">
        <div className="container">
          <InterviewProtected watermark={`${user.name} / ${user.loginId} / local-demo`}>
            <div className="sectionHeader">
              <h2>면접 후기 게시판</h2>
              <p className="sectionLead">학회원 전용으로 인턴, 공모전, 채용 인터뷰 경험을 공유합니다.</p>
            </div>
            <div className="privacyBox">
              <h3>회원 전용 자료입니다</h3>
              <p className="muted">외부 공유를 금지합니다. 열람 기록은 보안 목적의 감사 로그로 남을 수 있습니다.</p>
            </div>
            <div className="boardShell" style={{ marginTop: 24 }}>
              <BoardTools
                primary="전체 직무"
                secondary="전체 회사 유형"
                placeholder="기업명 또는 키워드 검색"
                primaryName="category"
                secondaryName="companyType"
                primaryOptions={INTERVIEW_CATEGORY_OPTIONS}
                categoryOptions={INTERVIEW_COMPANY_TYPE_OPTIONS}
                selectedPrimary={category}
                selectedCategory={companyType}
                query={q}
              />
              <BoardList
                posts={result.posts}
                basePath="/member/interviews"
                labelForPost={(post) => categoryLabel(post.category, "직무")}
                trailingHeader="회사 유형"
                trailingValueForPost={(post) => categoryLabel(post.companyType, "미지정")}
                showDownload={false}
              />
              <Pagination page={result.page} totalPages={result.totalPages} hrefForPage={(targetPage) => buildHref({ category, companyType, q }, targetPage)} />
              <div className="actionRow" style={{ justifyContent: "flex-end" }}>
                <Link className="button" href="/member/interviews/new">
                  후기 작성
                </Link>
              </div>
            </div>
          </InterviewProtected>
        </div>
      </section>
    </main>
  );
}
