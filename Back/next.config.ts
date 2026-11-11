import type { NextConfig } from "next";

const privateHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "Pragma", value: "no-cache" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/**": ["./data/**/*", "./storage/**/*"],
  },
  async headers() {
    return [
      { source: "/member/:path*", headers: privateHeaders },
      { source: "/admin/:path*", headers: privateHeaders },
      { source: "/api/member/:path*", headers: privateHeaders },
      { source: "/api/admin/:path*", headers: privateHeaders },
      { source: "/api/attachments/:path*", headers: privateHeaders },
    ];
  },
};

export default nextConfig;
