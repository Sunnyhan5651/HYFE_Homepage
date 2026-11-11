import Link from "next/link";
import { AccessNotice } from "@/components/auth/AccessNotice";
import { BoardList, BoardTools, Pagination } from "@/components/boards/BoardList";
import { SubNavigation } from "@/components/navigation/SubNavigation";
import { SubHero } from "@/components/sections/SubHero";
import { requireRole } from "@/lib/auth/session";
import { banners, memberTabs, withActive } from "@/lib/content/site-content";
import { listPaginatedPostsByBoards } from "@/lib/db/post-repository";

export const dynamic = "force-dynamic";

const marketBoards = ["TEAM_RESEARCH_OUTPUT", "TEAM_QUANT_OUTPUT", "TEAM_DERIVATIVES_OUTPUT", "TEAM_IB_OUTPUT"] as const;
const boardHref = {
  TEAM_RESEARCH_OUTPUT: "/member/teams/research",
  TEAM_QUANT_OUTPUT: "/member/teams/quant",
  TEAM_DERIVATIVES_OUTPUT: "/member/teams/derivatives",
  TEAM_IB_OUTPUT: "/member/teams/ib",
} as const;

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function pageParam(value: string | string[] | undefined): number {
  const page = Number(firstParam(value));
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function buildHref(params: { q?: string }, page: number): string {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (page > 1) query.set("page", String(page));
  const suffix = query.toString();
  return suffix ? `/member/market?${suffix}` : "/member/market";
}

export default async function MemberMarketPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  try {
    await requireRole("MEMBER");
  } catch (error) {
    return <AccessNotice message={(error as Error).message} />;
  }

  const params = await searchParams;
  const q = firstParam(params.q).trim();
  const page = pageParam(params.page);
  const result = await listPaginatedPostsByBoards({ boardTypes: [...marketBoards], category: "session-material", q, page, pageSize: 8 });

  return (
    <main>
      <SubHero title="MEMBER" subtitle="정규 세션에서 공유한 시장 흐름과 주요 이슈를 확인합니다." image={banners.memberTeam} parent="Member" current="시황" />
      <SubNavigation section="MEMBER" links={withActive(memberTabs, "/member/market")} />
      <section className="section">
        <div className="container boardShell">
          <div className="sectionHeader">
            <h2>시황</h2>
            <p className="sectionLead">팀 구분 없이 정규 세션에서 공유된 시장 업데이트를 한 곳에서 확인합니다.</p>
          </div>
          <BoardTools primary="시황" secondary="시황 자료" placeholder="시장, 산업, 키워드를 검색해 주세요" query={q} />
          <BoardList
            posts={result.posts}
            basePath="/member/market"
            hrefForPost={(post) => `${boardHref[post.boardType as keyof typeof boardHref]}/${post.id}`}
            labelForPost={() => "시황"}
            trailingHeader="범위"
            trailingValueForPost={(post) => (post.visibility === "PUBLIC" ? "공개" : "비공개")}
            showDownload={false}
          />
          <Pagination page={result.page} totalPages={result.totalPages} hrefForPage={(targetPage) => buildHref({ q }, targetPage)} />
          <div className="actionRow" style={{ justifyContent: "flex-end" }}>
            <Link className="button" href="/member/market/new">
              글쓰기
            </Link>
          </div>
          <div className="metaRow">
            <span>총 {result.total.toLocaleString("ko-KR")}건</span>
            {q ? <span>검색어: {q}</span> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
