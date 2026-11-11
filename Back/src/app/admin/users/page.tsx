import { AdminShell } from "@/components/admin/AdminShell";
import { requireRole } from "@/lib/auth/session";
import { listUsers } from "@/lib/db/user-repository";

export const dynamic = "force-dynamic";

const roleOptions = ["PENDING_USER", "MEMBER", "INTERVIEW_REVIEWER", "ADMIN"] as const;

export default async function AdminUsersPage() {
  await requireRole("ADMIN");
  const users = await listUsers();

  return (
    <AdminShell activeHref="/admin/users" title="회원 관리" description="가입 신청과 회원 역할을 관리합니다.">
      <div className="adminTableCard">
        <table className="adminTable">
          <thead>
            <tr>
              <th>이름</th>
              <th>ID</th>
              <th>Role</th>
              <th>승인 상태</th>
              <th>역할 변경</th>
              <th>승인/반려</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.loginId}</td>
                <td>{user.role}</td>
                <td>{user.approvedAt ? user.approvedAt.slice(0, 10) : user.rejectedAt ? `반려 ${user.rejectedAt.slice(0, 10)}` : "대기"}</td>
                <td>
                  <form action={`/api/admin/users/${user.id}/role`} className="inlineForm" method="post">
                    <select className="select compact" name="role" defaultValue={user.role}>
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <button className="button small" type="submit">
                      변경
                    </button>
                  </form>
                </td>
                <td>
                  <div className="inlineActions">
                    {user.role === "PENDING_USER" ? (
                      <form action={`/api/admin/users/${user.id}/approve`} method="post">
                        <button className="button small" type="submit">
                          승인
                        </button>
                      </form>
                    ) : null}
                    {user.role !== "ADMIN" ? (
                      <form action={`/api/admin/users/${user.id}/reject`} method="post">
                        <input name="reason" type="hidden" value="관리자 반려" />
                        <button className="button small secondary" type="submit">
                          반려
                        </button>
                      </form>
                    ) : (
                      "관리자"
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
