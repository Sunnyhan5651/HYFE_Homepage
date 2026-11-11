import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { canReadBoard } from "@/lib/board-policy/board-policy";
import { rejectCrossOriginMutation } from "@/lib/auth/csrf";
import { createSessionToken, verifySessionToken } from "@/lib/auth/session-token";
import { getEditablePost, getReadablePost } from "@/lib/db/post-repository";
import { saveDemoDatabase } from "@/lib/db/local-store";
import { createSeedDatabase } from "@/lib/db/seed-data";

describe("G005 security metadata", () => {
  it("sets private noindex/no-store headers for member/admin/private APIs", async () => {
    expect(typeof nextConfig.headers).toBe("function");
    const headers = await nextConfig.headers!();
    const sources = headers.map((entry) => entry.source);
    expect(sources).toEqual(expect.arrayContaining(["/member/:path*", "/admin/:path*", "/api/member/:path*", "/api/admin/:path*", "/api/attachments/:path*"]));
    for (const entry of headers) {
      expect(entry.headers).toEqual(expect.arrayContaining([
        { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        { key: "Cache-Control", value: "private, no-store, max-age=0" },
      ]));
    }
  });

  it("robots and sitemap exclude private routes", () => {
    const robotRules = robots().rules as { disallow?: string[] };
    expect(robotRules.disallow).toEqual(expect.arrayContaining(["/member/", "/admin/", "/api/member/", "/api/admin/", "/api/attachments/"]));
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.some((url) => url.includes("/member"))).toBe(false);
    expect(urls.some((url) => url.includes("/admin"))).toBe(false);
  });

  it("denies visitor/pending reads for private board APIs by policy", () => {
    expect(canReadBoard("PUBLIC_REPORT", "VISITOR")).toBe(true);
    expect(canReadBoard("TEAM_IB_OUTPUT", "VISITOR")).toBe(false);
    expect(canReadBoard("TEAM_IB_OUTPUT", "PENDING_USER")).toBe(false);
    expect(canReadBoard("TEAM_IB_OUTPUT", "MEMBER")).toBe(true);
    expect(canReadBoard("INTERVIEW_REVIEW", "MEMBER")).toBe(false);
    expect(canReadBoard("INTERVIEW_REVIEW", "INTERVIEW_REVIEWER")).toBe(true);
  });

  it("rejects forged raw user-id session cookies and tampered/expired tokens", () => {
    const token = createSessionToken("user-admin", 4_000);
    expect(verifySessionToken(token, 3_000)).toBe("user-admin");
    expect(verifySessionToken("user-admin", 3_000)).toBeNull();
    expect(verifySessionToken(token.replace("user-admin", "user-member"), 3_000)).toBeNull();
    expect(verifySessionToken(token, 5_000)).toBeNull();
  });

  it("blocks cross-origin mutations while allowing same-origin and CLI/no-origin local demo requests", () => {
    expect(rejectCrossOriginMutation(new Request("http://localhost:3000/api", { method: "POST", headers: { origin: "http://evil.test", host: "localhost:3000" } }))).not.toBeNull();
    expect(rejectCrossOriginMutation(new Request("http://localhost:3000/api", { method: "POST", headers: { origin: "http://localhost:3000", host: "localhost:3000" } }))).toBeNull();
    expect(rejectCrossOriginMutation(new Request("http://localhost:3000/api", { method: "POST", headers: { host: "localhost:3000" } }))).toBeNull();
  });

  it("prevents cross-route page reads and edit reads for mismatched private board posts", async () => {
    await saveDemoDatabase(createSeedDatabase());
    await expect(getReadablePost({ id: "post-team-ib-1", expectedBoardType: "PUBLIC_REPORT", actorRole: "VISITOR" })).resolves.toBeNull();
    await expect(getReadablePost({ id: "post-interview-1", expectedBoardType: "TEAM_IB_OUTPUT", actorRole: "MEMBER" })).resolves.toBeNull();
    await expect(getReadablePost({ id: "post-team-ib-1", expectedBoardType: "TEAM_IB_OUTPUT", actorRole: "MEMBER" })).resolves.toMatchObject({ id: "post-team-ib-1" });
    await expect(getEditablePost({ id: "post-team-ib-1", expectedBoardType: "TEAM_IB_OUTPUT", actor: { id: "user-pending", role: "PENDING_USER" } })).resolves.toBeNull();
  });
});
