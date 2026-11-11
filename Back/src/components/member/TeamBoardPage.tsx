import Link from "next/link";
import { AccessNotice } from "@/components/auth/AccessNotice";
import { BoardList, BoardTools, Pagination } from "@/components/boards/BoardList";
import { SubNavigation } from "@/components/navigation/SubNavigation";
import { SubHero } from "@/components/sections/SubHero";
import { requireRole } from "@/lib/auth/session";
import { TEAM_CATEGORY_OPTIONS } from "@/lib/board-policy/post-categories";
import { TEAM_ROUTE_CONFIG, type TeamSlug } from "@/lib/board-policy/team-routes";
import { banners, memberTabs, teamCards, withActive } from "@/lib/content/site-content";
import { listPaginatedPosts } from "@/lib/db/post-repository";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function pageParam(value: string | string[] | undefined): number {
  const page = Number(firstParam(value));
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function buildHref(basePath: string, params: { q?: string; category?: string }, page: number): string {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.q) query.set("q", params.q);
  if (page > 1) query.set("page", String(page));
  const suffix = query.toString();
  return suffix ? `${basePath}?${suffix}` : basePath;
}

export async function TeamBoardPage({ team, searchParams }: { team: TeamSlug; searchParams?: Promise<SearchParams> }) {
  try {
    await requireRole("MEMBER");
  } catch (error) {
    return <AccessNotice message={(error as Error).message} />;
  }
  const config = TEAM_ROUTE_CONFIG[team];
  const params = (await searchParams) ?? {};
  const q = firstParam(params.q).trim();
  const category = firstParam(params.category).trim();
  const page = pageParam(params.page);
  const activeHref = `/member/teams/${team}`;
  const result = await listPaginatedPosts({ boardType: config.boardType, category, q, page, pageSize: 6 });

  return (
    <main>
      <SubHero
        title="MEMBER"
        subtitle="팀별 리서치와 학회원 자료를 관리합니다."
        image={banners.memberTeam}
        parent="Member"
        current="팀 게시판"
      />
      <SubNavigation section="MEMBER" links={withActive(memberTabs, "/member/teams/research")} />

      <section className="section">
        <div className="container boardShell">
          <div className="sectionHeader">
            <h2>{config.koreanLabel} 게시판</h2>
            <p className="sectionLead">정규 팀별 리서치 진행 상황과 자료를 공유합니다.</p>
          </div>

          <div className="featureGrid four">
            {teamCards.map((card) => (
              <Link className="featureCard" href={card.href} key={card.title}>
                <span className="miniIcon">{card.title.slice(0, 1)}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </Link>
            ))}
          </div>

          <BoardTools
            primary={config.koreanLabel}
            secondary="전체 분류"
            placeholder="검색어를 입력해 주세요"
            categoryOptions={TEAM_CATEGORY_OPTIONS}
            selectedCategory={category}
            query={q}
          />
          <BoardList
            posts={result.posts}
            basePath={activeHref}
            trailingHeader="범위"
            visibilityForPost={(post) => (post.visibility === "PUBLIC" ? "공개" : "비공개")}
          />
          <Pagination page={result.page} totalPages={result.totalPages} hrefForPage={(targetPage) => buildHref(activeHref, { category, q }, targetPage)} />
          <div className="actionRow" style={{ justifyContent: "flex-end" }}>
            <Link className="button" href={`${activeHref}/new`}>
              글쓰기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
