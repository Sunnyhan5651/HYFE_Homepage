import type { ReactNode } from "react";
import Link from "next/link";

const adminNav = [
  ["/admin", "Dashboard"],
  ["/admin/users", "Members"],
  ["/admin/posts", "Reports"],
  ["/admin/recruiting", "Recruiting"],
  ["/admin/banners", "Banners"],
  ["/admin/audit-logs", "Audit Logs"],
] as const;

export function AdminShell({
  activeHref,
  title,
  description,
  action,
  children,
}: {
  activeHref: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="adminLayout">
      <aside className="adminSidebar">
        <Link href="/admin" className="brand">
          <span className="brandMark">H</span>
          <span className="brandText">
            <strong>HYFE</strong>
            <span>Admin</span>
          </span>
        </Link>
        <nav className="adminNav" aria-label="관리자 메뉴">
          {adminNav.map(([href, label]) => (
            <Link className={href === activeHref ? "active" : undefined} href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <section className="adminMain">
        <div className="adminTopbar">
          <div>
            <h1>{title}</h1>
            {description ? <p className="muted">{description}</p> : null}
          </div>
          {action}
        </div>
        {children}
      </section>
    </main>
  );
}
