import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES } from "@/lib/navigation/site-map";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_BASE_URL ?? "http://localhost:3000";
  return PUBLIC_ROUTES.map((route) => ({ url: `${base}${route}`, lastModified: new Date("2026-07-02") }));
}
