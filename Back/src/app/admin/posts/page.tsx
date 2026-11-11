import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { categoryLabel } from "@/lib/board-policy/post-categories";
import { requireRole } from "@/lib/auth/session";
import { loadDemoDatabase } from "@/lib/db/local-store";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function hrefForPost(post: { id: string; boardType: string }): string {
  if (post.boardType === "PUBLIC_REPORT" || post.boardType === "RECRUIT_MATERIAL") return `/reports/${post.id}`;
  if (post.boardType === "MEMBER_NOTICE") return `/member/notices/${post.id}`;
  return "/member";
}

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireRole("ADMIN");
  const db = await loadDemoDatabase();
  const params = await searchParams;
  const q = firstParam(params.q).trim().toLowerCase();
  const status = firstParam(params.status).trim();
  const posts = db.posts
    .filter((post) => {
      if (status === "active" && post.deletedAt) return false;
      if (status === "deleted" && !post.deletedAt) return false;
      return !q || `${post.boardType} ${post.title} ${post.content}`.toLowerCase().includes(q);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <AdminShell activeHref="/admin/posts" title="게시글 관리" description="전체 게시글 상태를 확인하고 비공개 처리할 수 있습니다.">
      <div className="adminTableCard">
        <form className="boardTools" method="get">
          <select className="select" name="scope" defaultValue="">
            <option value="">전체 게시판</option>
          </select>
          <select className="select" name="status" defaultValue={status}>
            <option value="">전체 상태</option>
            <option value="active">활성</option>
            <option value="deleted">삭제됨</option>
          </select>
          <input className="field" name="q" placeholder="게시글 검색" defaultValue={q} />
          <button className="button" type="submit">
            검색
          </button>
        </form>
        <table className="adminTable">
          <thead>
            <tr>
              <th>Board</th>
              <th>분류</th>
              <th>제목</th>
              <th>작성자</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.boardType}</td>
                <td>{categoryLabel(post.category)}</td>
                <td>
                  {post.boardType === "INTERVIEW_REVIEW" ? (
                    post.title
                  ) : (
                    <Link href={hrefForPost(post)}>
                      {post.title}
                    </Link>
                  )}
                </td>
                <td>{post.authorId}</td>
                <td>{post.deletedAt ? "삭제됨" : "활성"}</td>
                <td>
                  {!post.deletedAt ? (
                    <form action={`/api/admin/posts/${post.id}/delete`} method="post">
                      <button className="button danger small" type="submit">
                        삭제
                      </button>
                    </form>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
