"use client";

import Link from "next/link";
import { useState } from "react";
import { TOP_NAV } from "@/lib/navigation/site-map";

export function MobileDrawer({ userName, accountHref = "/member" }: { userName: string | null; accountHref?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobileDrawer">
      <button type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
        MENU
      </button>
      {open ? (
        <div className="drawerPanel" id="mobile-menu">
          <button type="button" onClick={() => setOpen(false)}>
            CLOSE
          </button>
          <nav aria-label="모바일 메뉴">
            <Link href="/" onClick={() => setOpen(false)}>
              HOME
            </Link>
            {TOP_NAV.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            {userName ? (
              <>
                <Link href={accountHref} onClick={() => setOpen(false)}>
                  {userName}님
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button className="textButton" type="submit">
                    LOGOUT
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/signup" onClick={() => setOpen(false)}>
                  JOIN
                </Link>
                <Link href="/login" onClick={() => setOpen(false)}>
                  LOGIN
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
