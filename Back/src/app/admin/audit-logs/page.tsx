import { AdminShell } from "@/components/admin/AdminShell";
import { requireRole } from "@/lib/auth/session";
import { loadDemoDatabase } from "@/lib/db/local-store";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  await requireRole("ADMIN");
  const db = await loadDemoDatabase();

  return (
    <AdminShell activeHref="/admin/audit-logs" title="Audit Logs" description="관리 작업과 열람 기록을 확인합니다.">
      <div className="adminTableCard">
        <p className="muted">Append-only event history입니다. 수정 및 삭제 작업은 제공하지 않습니다.</p>
        <table className="adminTable">
          <thead>
            <tr>
              <th>시간</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Actor</th>
            </tr>
          </thead>
          <tbody>
            {db.auditLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.createdAt}</td>
                <td>{log.action}</td>
                <td>
                  {log.resourceType}:{log.resourceId}
                </td>
                <td>{log.actorId ?? "system"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
