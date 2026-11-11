import Link from "next/link";
import { AccessNotice } from "@/components/auth/AccessNotice";
import { BoardList, BoardTools, Pagination } from "@/components/boards/BoardList";
import { SubNavigation } from "@/components/navigation/SubNavigation";
import { SubHero } from "@/components/sections/SubHero";
import { requireRole } from "@/lib/auth/session";
import { NOTICE_CATEGORY_OPTIONS } from "@/lib/board-policy/post-categories";
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

function buildHref(params: { q?: string; category?: string }, page: number): string {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.q) query.set("q", params.q);
  if (page > 1) query.set("page", String(page));
  const suffix = query.toString();
  return suffix ? `/member/notices?${suffix}` : "/member/notices";
}

export default async function MemberNoticesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  try {
    await requireRole("MEMBER");
  } catch (error) {
    return <AccessNotice message={(error as Error).message} />;
  }
  const params = await searchParams;
  const q = firstParam(params.q).trim();
  const category = firstParam(params.category).trim();
  const page = pageParam(params.page);
  const result = await listPaginatedPosts({ boardType: "MEMBER_NOTICE", category, q, page, pageSize: 8 });

  return (
    <main>
      <SubHero title="MEMBER" subtitle="회원 공지와 운영 안내를 확인합니다." image={banners.memberTeam} parent="Member" current="공지사항" />
      <SubNavigation section="MEMBER" links={withActive(memberTabs, "/member/notices")} />
      <section className="section">
        <div className="container boardShell">
          <div className="sectionHeader">
            <h2>공지사항</h2>
            <p className="sectionLead">팀 게시판과 분리된 회원 전용 공지입니다.</p>
          </div>
          <BoardTools primary="공지사항" secondary="공지 분류" categoryOptions={NOTICE_CATEGORY_OPTIONS} selectedCategory={category} query={q} />
          <BoardList posts={result.posts} basePath="/member/notices" trailingHeader="열람" trailingValueForPost={() => "상세"} showDownload={false} />
          <Pagination page={result.page} totalPages={result.totalPages} hrefForPage={(targetPage) => buildHref({ category, q }, targetPage)} />
          <div className="actionRow" style={{ justifyContent: "flex-end" }}>
            <Link className="button" href="/member/notices/new">
              글쓰기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
