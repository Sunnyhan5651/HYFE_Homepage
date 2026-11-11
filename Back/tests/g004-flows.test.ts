import { describe, expect, it } from "vitest";
import { addAttachment, createPost, getAttachmentForDownload, listPaginatedPosts, listPublicReportPosts, recordInterviewViewed } from "@/lib/db/post-repository";
import { saveDemoDatabase, loadDemoDatabase } from "@/lib/db/local-store";
import { createSeedDatabase } from "@/lib/db/seed-data";
import { TEAM_ROUTE_CONFIG } from "@/lib/board-policy/team-routes";
import { updateBanner, updateRecruitmentAsset } from "@/lib/db/admin-repository";
import { changeUserRole, rejectUser } from "@/lib/db/user-repository";

describe("G004 member/interview/admin flows", () => {
  it("lets any member write every team board without team membership", async () => {
    await saveDemoDatabase(createSeedDatabase());
    for (const config of Object.values(TEAM_ROUTE_CONFIG)) {
      const post = await createPost({ actor: { id: "user-member", role: "MEMBER" }, boardType: config.boardType, payload: { title: `${config.label} 자료`, content: "본문" } });
      expect(post.boardType).toBe(config.boardType);
    }
  });

  it("denies interview reviews to MEMBER but allows INTERVIEW_REVIEWER", async () => {
    await saveDemoDatabase(createSeedDatabase());
    await expect(createPost({ actor: { id: "user-member", role: "MEMBER" }, boardType: "INTERVIEW_REVIEW", payload: { title: "x", content: "y" } })).rejects.toThrow(/접근 권한/);
    const post = await createPost({ actor: { id: "user-interview", role: "INTERVIEW_REVIEWER" }, boardType: "INTERVIEW_REVIEW", payload: { title: "후기", content: "내용" } });
    expect(post.boardType).toBe("INTERVIEW_REVIEW");
  });

  it("records interview views and keeps audit logs append-only/read-only at data level", async () => {
    await saveDemoDatabase(createSeedDatabase());
    await recordInterviewViewed({ actorId: "user-interview", postId: "post-interview-1" });
    const db = await loadDemoDatabase();
    expect(db.auditLogs.some((log) => log.action === "INTERVIEW_VIEWED" && log.resourceId === "post-interview-1")).toBe(true);
    expect(Object.keys(db.auditLogs[0])).not.toContain("updatedAt");
    expect(Object.keys(db.auditLogs[0])).not.toContain("deletedAt");
  });

  it("records private download actor identity", async () => {
    await saveDemoDatabase(createSeedDatabase());
    const attachment = await addAttachment({
      actor: { id: "user-member", role: "MEMBER" },
      postId: "post-team-ib-1",
      filename: "audit.pdf",
      mimeType: "application/pdf",
      contents: "private",
    });
    await getAttachmentForDownload({ actorRole: "MEMBER", actorId: "user-member", attachmentId: attachment.id });
    const db = await loadDemoDatabase();
    expect(db.auditLogs).toContainEqual(expect.objectContaining({ action: "ATTACHMENT_DOWNLOADED", actorId: "user-member", resourceId: attachment.id }));
  });

  it("filters and paginates board posts by category and query", async () => {
    await saveDemoDatabase(createSeedDatabase());
    const industry = await listPaginatedPosts({ boardType: "PUBLIC_REPORT", category: "industry", q: "전력", page: 1, pageSize: 2 });
    expect(industry.total).toBe(1);
    expect(industry.posts[0]).toMatchObject({ id: "post-public-3", category: "industry" });
    const firstPage = await listPaginatedPosts({ boardType: "PUBLIC_REPORT", page: 1, pageSize: 2 });
    expect(firstPage.posts).toHaveLength(2);
    expect(firstPage.totalPages).toBeGreaterThan(1);
  });

  it("keeps notices separate and exposes public team market posts in public reports", async () => {
    await saveDemoDatabase(createSeedDatabase());
    const notice = await createPost({ actor: { id: "user-member", role: "MEMBER" }, boardType: "MEMBER_NOTICE", payload: { title: "회원 공지", content: "본문" } });
    expect(notice.boardType).toBe("MEMBER_NOTICE");

    const notices = await listPaginatedPosts({ boardType: "MEMBER_NOTICE", page: 1, pageSize: 4 });
    expect(notices.posts.some((post) => post.id === "post-member-notice-1")).toBe(true);

    const publicMarket = await listPublicReportPosts({ category: "market" });
    expect(publicMarket.some((post) => post.id === "post-team-ib-1")).toBe(true);
    expect(publicMarket.every((post) => post.visibility === "PUBLIC")).toBe(true);
  });

  it("supports local admin user role changes and rejection", async () => {
    await saveDemoDatabase(createSeedDatabase());
    const reviewer = await changeUserRole({ actorId: "user-admin", userId: "user-member", role: "INTERVIEW_REVIEWER" });
    expect(reviewer.role).toBe("INTERVIEW_REVIEWER");
    const rejected = await rejectUser({ actorId: "user-admin", userId: "user-member", reason: "테스트 반려" });
    expect(rejected).toMatchObject({ role: "PENDING_USER", rejectionReason: "테스트 반려" });
  });

  it("supports minimal admin CMS demo mutations with audit evidence", async () => {
    await saveDemoDatabase(createSeedDatabase());
    await updateBanner({ actorId: "user-admin", bannerId: "banner-home", altText: "updated demo banner", overlayOpacity: 0.4 });
    await updateRecruitmentAsset({ actorId: "user-admin", assetId: "recruit-application-1", isActive: false });
    const db = await loadDemoDatabase();
    expect(db.banners.find((banner) => banner.id === "banner-home")).toMatchObject({ altText: "updated demo banner", overlayOpacity: 0.4 });
    expect(db.recruitmentAssets.find((asset) => asset.id === "recruit-application-1")).toMatchObject({ isActive: false });
    expect(db.auditLogs).toEqual(expect.arrayContaining([
      expect.objectContaining({ action: "BANNER_UPDATED", actorId: "user-admin" }),
      expect.objectContaining({ action: "RECRUITMENT_ASSET_UPDATED", actorId: "user-admin" }),
    ]));
  });
});
