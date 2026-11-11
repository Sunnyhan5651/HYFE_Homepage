import Link from "next/link";
import { BoardList, BoardTools, Pagination } from "@/components/boards/BoardList";
import { SubNavigation } from "@/components/navigation/SubNavigation";
import { SubHero } from "@/components/sections/SubHero";
import type { BoardType } from "@/lib/board-policy/board-policy";
import { REPORT_CATEGORY_OPTIONS, RECRUIT_CATEGORY_OPTIONS, categoryLabel } from "@/lib/board-policy/post-categories";
import { banners, recruitingTabs, reportTabs, withActive } from "@/lib/content/site-content";
import { listPaginatedPosts, listPaginatedPublicReportPosts } from "@/lib/db/post-repository";
import type { PostRecord } from "@/lib/db/schema";

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

function reportLabelForPost(post: PostRecord): string {
  if (post.boardType.startsWith("TEAM_")) return "시황";
  return categoryLabel(post.category, "자료");
}

export async function ReportsBoardPage({
  title,
  lead,
  current,
  activePath,
  boardType = "PUBLIC_REPORT",
  fixedCategory = "",
  searchParams,
}: {
  title: string;
  lead: string;
  current: string;
  activePath: string;
  boardType?: BoardType;
  fixedCategory?: string;
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const q = firstParam(params.q).trim();
  const selectedCategory = fixedCategory || firstParam(params.category).trim();
  const page = pageParam(params.page);
  const categories = boardType === "RECRUIT_MATERIAL" ? RECRUIT_CATEGORY_OPTIONS : REPORT_CATEGORY_OPTIONS;
  const result =
    boardType === "PUBLIC_REPORT"
      ? await listPaginatedPublicReportPosts({ category: selectedCategory, q, page, pageSize: 6 })
      : await listPaginatedPosts({ boardType, category: selectedCategory, q, page, pageSize: 6 });
  const isRecruiting = boardType === "RECRUIT_MATERIAL";

  return (
    <main>
      <SubHero
        title={isRecruiting ? "RECRUITING" : "REPORTS"}
        subtitle={isRecruiting ? "지원 전 확인할 수 있는 리크루팅 자료입니다." : "HYFE의 공개 리서치와 투자 아이디어"}
        image={isRecruiting ? banners.recruiting : banners.reports}
        parent={isRecruiting ? "Recruiting" : "Reports"}
        current={current}
      />
      <SubNavigation section={isRecruiting ? "RECRUITING" : "REPORTS"} links={withActive(isRecruiting ? recruitingTabs : reportTabs, activePath)} />

      <section className="section">
        <div className="container boardShell">
          <div className="sectionHeader">
            <span className="eyebrow">{isRecruiting ? "RECRUITING" : "REPORTS"}</span>
            <h2>{title}</h2>
            <p className="sectionLead">{lead}</p>
          </div>

          <BoardTools
            primary={current}
            secondary="전체 분류"
            categoryOptions={categories}
            selectedCategory={selectedCategory}
            query={q}
          />

          {!isRecruiting ? (
          <div className="actionRow">
            <Link className={!selectedCategory && activePath === "/reports" ? "tag" : "button secondary small"} href="/reports">
              전체
            </Link>
            {REPORT_CATEGORY_OPTIONS.map((option) => (
              <Link
                className={selectedCategory === option.value ? "tag" : "button secondary small"}
                href={buildHref("/reports", { category: option.value, q }, 1)}
                key={option.value}
              >
                {option.label}
              </Link>
            ))}
          </div>
          ) : null}

          <BoardList posts={result.posts} basePath="/reports" labelForPost={isRecruiting ? undefined : reportLabelForPost} />
          <Pagination page={result.page} totalPages={result.totalPages} hrefForPage={(targetPage) => buildHref(activePath, { category: selectedCategory, q }, targetPage)} />

          <div className="metaRow">
            <span>총 {result.total.toLocaleString("ko-KR")}건</span>
            {q ? <span>검색어: {q}</span> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
