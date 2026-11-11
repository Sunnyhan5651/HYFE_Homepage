import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function SiteChrome({ children }: { children: ReactNode }) {
  return <><Header />{children}<Footer /></>;
}
