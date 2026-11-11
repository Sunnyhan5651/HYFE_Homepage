import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { TOP_NAV } from "@/lib/navigation/site-map";
import { MobileDrawer } from "@/components/navigation/MobileDrawer";

export async function Header() {
  const user = await getSessionUser();
  const accountHref = user?.role === "ADMIN" ? "/admin" : "/member";

  return (
    <header className="siteHeader">
      <div className="headerInner">
        <Link href="/" className="brand" aria-label="HYFE home">
          <span className="brandMark">H</span>
          <span className="brandText">
            <strong>HYFE</strong>
            <span>한양대학교 금융공학회</span>
          </span>
        </Link>

        <nav className="desktopNav" aria-label="주요 메뉴">
          <Link href="/">HOME</Link>
          {TOP_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <nav className="accountNav" aria-label="회원 메뉴">
          {user ? (
            <>
              <Link href={accountHref}>{user.name}님</Link>
              <form action="/api/auth/logout" method="post">
                <button className="textButton" type="submit">
                  LOGOUT
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/signup">JOIN</Link>
              <Link href="/login">LOGIN</Link>
            </>
          )}
        </nav>

        <MobileDrawer userName={user?.name ?? null} accountHref={accountHref} />
      </div>
    </header>
  );
}
