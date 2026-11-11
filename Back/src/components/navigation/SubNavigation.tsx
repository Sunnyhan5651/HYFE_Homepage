import Link from "next/link";

type SubNavLink = {
  href: string;
  label: string;
  active?: boolean;
};

export function SubNavigation({ section, links }: { section: string; links: SubNavLink[] }) {
  return (
    <nav className="subNav" aria-label="하위 메뉴">
      <span className="subHome" aria-current="page">
        {section}
      </span>
      <div className="subNavLinks">
        {links.map((link) => (
          <Link className={link.active ? "active" : undefined} key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
