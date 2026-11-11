import Link from "next/link";
import type { CategoryOption } from "@/lib/board-policy/post-categories";
import { categoryLabel } from "@/lib/board-policy/post-categories";
import type { PostRecord } from "@/lib/db/schema";

const boardLabels: Record<PostRecord["boardType"], string> = {
  PUBLIC_REPORT: "공개",
  TEAM_IB_OUTPUT: "IB",
  TEAM_RESEARCH_OUTPUT: "Research",
  TEAM_DERIVATIVES_OUTPUT: "Derivatives",
  TEAM_QUANT_OUTPUT: "Quant",
  MEMBER_NOTICE: "공지",
  INTERVIEW_REVIEW: "회원",
  RECRUIT_MATERIAL: "자료",
};

function authorLabel(authorId: string) {
  if (authorId.includes("admin")) return "관리자";
  if (authorId.includes("interview")) return "HYFE 커리어팀";
  return "HYFE 리서치팀";
}

export function BoardTools({
  primary = "전체",
  secondary = "전체",
  placeholder = "검색어를 입력해 주세요",
  buttonLabel = "검색",
  primaryName = "scope",
  secondaryName = "category",
  primaryOptions = [],
  categoryOptions = [],
  selectedPrimary = "",
  selectedCategory = "",
  query = "",
}: {
  primary?: string;
  secondary?: string;
  placeholder?: string;
  buttonLabel?: string;
  primaryName?: string;
  secondaryName?: string;
  primaryOptions?: readonly CategoryOption[];
  categoryOptions?: readonly CategoryOption[];
  selectedPrimary?: string;
  selectedCategory?: string;
  query?: string;
}) {
  return (
    <form className="boardTools" method="get">
      <select className="select" aria-label={primary} name={primaryName} defaultValue={selectedPrimary}>
        <option value="">{primary}</option>
        {primaryOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select className="select" aria-label={secondary} name={secondaryName} defaultValue={selectedCategory}>
        <option value="">{secondary}</option>
        {categoryOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input className="field" name="q" placeholder={placeholder} defaultValue={query} />
      <button className="button" type="submit">
        {buttonLabel}
      </button>
    </form>
  );
}

export function BoardList({
  posts,
  basePath,
  hrefForPost,
  labelForPost,
  trailingHeader,
  trailingValueForPost,
  visibilityForPost,
  showDownload = true,
  showScope = false,
}: {
  posts: PostRecord[];
  basePath: string;
  hrefForPost?: (post: PostRecord) => string;
  labelForPost?: (post: PostRecord) => string;
  trailingHeader?: string;
  trailingValueForPost?: (post: PostRecord) => string;
  visibilityForPost?: (post: PostRecord) => string;
  showDownload?: boolean;
  showScope?: boolean;
}) {
  return (
    <div className="boardTable">
      <div className="boardRow header">
        <span>No</span>
        <span>분류</span>
        <span>제목</span>
        <span>작성자</span>
        <span>발행일</span>
        <span>조회수</span>
        <span>{trailingHeader ?? (showScope ? "범위" : "자료")}</span>
      </div>
      {posts.map((post, index) => (
        <div className="boardRow" key={post.id}>
          <span>{String(posts.length - index).padStart(2, "0")}</span>
          <span className="tag">{labelForPost ? labelForPost(post) : showScope ? boardLabels[post.boardType] : categoryLabel(post.category, boardLabels[post.boardType])}</span>
          <Link className="boardTitle" href={hrefForPost ? hrefForPost(post) : `${basePath}/${post.id}`}>
            <strong>{post.title}</strong>
            <span>{post.content}</span>
          </Link>
          <span>{authorLabel(post.authorId)}</span>
          <span>{post.createdAt.slice(0, 10)}</span>
          <span>{post.viewCount.toLocaleString("ko-KR")}</span>
          <span>{trailingValueForPost ? trailingValueForPost(post) : visibilityForPost ? visibilityForPost(post) : showScope ? "회원" : showDownload ? "다운로드" : "-"}</span>
        </div>
      ))}
      {posts.length === 0 ? (
        <div className="summaryBox">
          <h3>게시글이 없습니다.</h3>
          <p className="muted">첫 자료를 등록하면 이 목록에 표시됩니다.</p>
        </div>
      ) : null}
    </div>
  );
}

export function Pagination({
  page = 1,
  totalPages = 1,
  hrefForPage = (targetPage: number) => `?page=${targetPage}`,
}: {
  page?: number;
  totalPages?: number;
  hrefForPage?: (targetPage: number) => string;
}) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  return (
    <div className="pagination" aria-label="페이지">
      {pages.map((targetPage) =>
        targetPage === page ? (
          <span className="current" key={targetPage}>
            {targetPage}
          </span>
        ) : (
          <Link href={hrefForPage(targetPage)} key={targetPage}>
            {targetPage}
          </Link>
        ),
      )}
      {page < totalPages ? <Link href={hrefForPage(page + 1)}>›</Link> : null}
    </div>
  );
}
