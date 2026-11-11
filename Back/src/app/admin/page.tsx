import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireRole } from "@/lib/auth/session";
import { loadDemoDatabase } from "@/lib/db/local-store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireRole("ADMIN");
  const db = await loadDemoDatabase();
  const pending = db.users.filter((candidate) => candidate.role === "PENDING_USER" && !candidate.deletedAt);
  const posts = db.posts.filter((post) => !post.deletedAt);
  const reports = posts.filter((post) => post.boardType === "PUBLIC_REPORT");

  return (
    <AdminShell
      activeHref="/admin"
      title="Admin Dashboard"
      description={`${user.name} 관리자 계정`}
      action={(
        <form action="/admin/posts" method="get" style={{ maxWidth: 360, width: "100%" }}>
          <input className="field" name="q" placeholder="회원 / 게시글 검색" />
        </form>
      )}
    >
        <div className="adminGrid">
          {[
            ["전체 회원", db.users.filter((candidate) => !candidate.deletedAt).length, "승인 회원과 대기 회원"],
            ["승인 대기", pending.length, "검토가 필요한 가입 신청"],
            ["공개 리포트", reports.length, "공개 게시판 자료"],
            ["이번 달 게시글", posts.length, "로컬 데모 전체 게시글"],
          ].map(([title, value, body]) => (
            <article className="statCard" key={String(title)}>
              <span className="statIcon">{String(title).slice(0, 1)}</span>
              <div>
                <p>{title}</p>
                <strong>{value}</strong>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="adminPanels">
          <section className="adminPanel">
            <h2>월별 활동 현황</h2>
            <div className="lineChart" aria-hidden="true" />
          </section>
          <section className="adminPanel">
            <h2>리크루팅 현황</h2>
            <div className="barChart">
              {[
                ["지원서 접수", 90],
                ["서류 검토", 72],
                ["인터뷰", 44],
                ["합격", 18],
              ].map(([label, value]) => (
                <div className="barRow" key={String(label)}>
                  <span>{label}</span>
                  <span className="barTrack">
                    <span style={{ width: `${value}%` }} />
                  </span>
                  <b>{value}</b>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="adminPanels">
          <section className="adminTableCard">
            <h2>최근 가입 신청</h2>
            <table className="adminTable">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>아이디</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {pending.slice(0, 5).map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.name}</td>
                    <td>{candidate.loginId}</td>
                    <td>승인 대기</td>
                    <td>
                      <Link className="button small" href="/admin/users">
                        확인
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="adminTableCard">
            <h2>최근 게시글</h2>
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Board</th>
                  <th>Title</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {posts.slice(0, 6).map((post) => (
                  <tr key={post.id}>
                    <td>{post.boardType}</td>
                    <td>{post.title}</td>
                    <td>{post.createdAt.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="adminPanels">
          <section className="adminPanel">
            <h2>빠른 작업</h2>
            <div className="featureGrid">
              <Link className="quickCard" href="/member/notices/new">
                <h3>공지 작성</h3>
                <p>팀 게시판과 분리된 회원 공지를 등록합니다.</p>
              </Link>
              <Link className="quickCard" href="/admin/users">
                <h3>회원 승인</h3>
                <p>가입 신청을 검토하고 승인합니다.</p>
              </Link>
              <Link className="quickCard" href="/admin/banners">
                <h3>배너 관리</h3>
                <p>페이지별 배너 설정을 확인합니다.</p>
              </Link>
              <Link className="quickCard" href="/admin/recruiting">
                <h3>안내자료 관리</h3>
                <p>리크루팅 자료 상태를 관리합니다.</p>
              </Link>
            </div>
          </section>
        </div>
    </AdminShell>
  );
}
