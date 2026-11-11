import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteChrome } from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  title: "HYFE | 한양대학교 금융공학회",
  description: "한양대학교 금융공학회 HYFE 공식 로컬 데모 웹사이트입니다.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
