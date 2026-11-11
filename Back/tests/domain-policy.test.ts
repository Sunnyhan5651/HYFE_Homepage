import { describe, expect, it } from "vitest";
import { canEditPost, hasRoleAtLeast, ROLE_LEVEL, type Role } from "@/lib/authorization/roles";
import { BOARD_POLICY, type BoardType } from "@/lib/board-policy/board-policy";
import { assertRouteBoardType, boardTypeForRoute } from "@/lib/board-policy/route-map";
import { findForbiddenPostFields } from "@/lib/board-policy/validation";
import { assertSingleAdmin } from "@/lib/db/local-store";
import { createSeedDatabase } from "@/lib/db/seed-data";
import { validateUpload, sanitizeFilename } from "@/lib/storage/upload-validation";

const BOARD_TYPES: BoardType[] = [
  "PUBLIC_REPORT",
  "TEAM_IB_OUTPUT",
  "TEAM_RESEARCH_OUTPUT",
  "TEAM_DERIVATIVES_OUTPUT",
  "TEAM_QUANT_OUTPUT",
  "MEMBER_NOTICE",
  "INTERVIEW_REVIEW",
  "RECRUIT_MATERIAL",
];

describe("role hierarchy", () => {
  it("keeps the approved hierarchy", () => {
    expect(ROLE_LEVEL).toEqual({ VISITOR: 0, PENDING_USER: 1, MEMBER: 2, INTERVIEW_REVIEWER: 3, ADMIN: 4 });
    expect(hasRoleAtLeast("ADMIN", "INTERVIEW_REVIEWER")).toBe(true);
    expect(hasRoleAtLeast("MEMBER", "INTERVIEW_REVIEWER")).toBe(false);
    expect(hasRoleAtLeast("VISITOR", "VISITOR")).toBe(true);
  });

  it("allows only author or admin to edit posts", () => {
    expect(canEditPost({ userId: "u1", userRole: "MEMBER", postAuthorId: "u1" })).toBe(true);
    expect(canEditPost({ userId: "u2", userRole: "MEMBER", postAuthorId: "u1" })).toBe(false);
    expect(canEditPost({ userId: "admin", userRole: "ADMIN", postAuthorId: "u1" })).toBe(true);
  });
});

describe("board policy", () => {
  it("defines every board type exactly once", () => {
    expect(Object.keys(BOARD_POLICY).sort()).toEqual([...BOARD_TYPES].sort());
  });

  it("preserves access, storage, and attachment invariants", () => {
    expect(BOARD_POLICY.PUBLIC_REPORT).toMatchObject({ readRole: "VISITOR", createRole: "ADMIN", storage: "public", allowAttachments: true, indexable: true });
    expect(BOARD_POLICY.INTERVIEW_REVIEW).toMatchObject({ readRole: "INTERVIEW_REVIEWER", createRole: "INTERVIEW_REVIEWER", storage: "none", allowAttachments: false, copyProtection: true });
    expect(BOARD_POLICY.MEMBER_NOTICE).toMatchObject({ readRole: "MEMBER", createRole: "MEMBER", storage: "none", allowAttachments: false, indexable: false });
    for (const type of ["TEAM_IB_OUTPUT", "TEAM_RESEARCH_OUTPUT", "TEAM_DERIVATIVES_OUTPUT", "TEAM_QUANT_OUTPUT"] as const) {
      expect(BOARD_POLICY[type]).toMatchObject({ readRole: "MEMBER", createRole: "MEMBER", storage: "private", allowAttachments: true, indexable: false });
    }
  });

  it("does not allow visitor-created posts on any board", () => {
    const createRoles: Role[] = Object.values(BOARD_POLICY).map((policy) => policy.createRole);
    expect(createRoles).not.toContain("VISITOR");
  });
});

describe("route-derived board type", () => {
  it.each([
    ["/reports", "PUBLIC_REPORT"],
    ["/reports/new", "PUBLIC_REPORT"],
    ["/reports/recruiting", "RECRUIT_MATERIAL"],
    ["/member/teams/ib", "TEAM_IB_OUTPUT"],
    ["/member/teams/research/new", "TEAM_RESEARCH_OUTPUT"],
    ["/member/teams/derivatives/123", "TEAM_DERIVATIVES_OUTPUT"],
    ["/member/teams/quant/123/edit", "TEAM_QUANT_OUTPUT"],
    ["/member/notices", "MEMBER_NOTICE"],
    ["/member/interviews", "INTERVIEW_REVIEW"],
    ["/admin/recruiting/materials", "RECRUIT_MATERIAL"],
  ] as const)("maps %s to %s", (route, expected) => {
    expect(boardTypeForRoute(route)).toBe(expected);
    expect(assertRouteBoardType(route)).toBe(expected);
  });

  it("returns null for non-board routes", () => {
    expect(boardTypeForRoute("/about")).toBeNull();
  });
});

describe("payload tamper defense", () => {
  it("finds forbidden post fields", () => {
    expect(findForbiddenPostFields({ title: "ok", category: "industry", board_type: "INTERVIEW_REVIEW", tags: ["x"], authorId: "evil" })).toEqual([
      "board_type",
      "tags",
      "authorId",
    ]);
  });
});

describe("upload validation", () => {
  it("allows approved document/image extensions and sanitizes names", () => {
    expect(sanitizeFilename("..//투자 보고서.pdf")).toBe("..__투자_보고서.pdf");
    expect(validateUpload({ filename: "report.pdf", fileSize: 1024 })).toMatchObject({ ok: true, extension: "pdf" });
    expect(validateUpload({ filename: "image.webp", fileSize: 1024 })).toMatchObject({ ok: true, extension: "webp" });
  });

  it("rejects dangerous or oversized uploads", () => {
    expect(validateUpload({ filename: "x.svg", fileSize: 1024 })).toMatchObject({ ok: false });
    expect(validateUpload({ filename: "x.html", fileSize: 1024 })).toMatchObject({ ok: false });
    expect(validateUpload({ filename: "x.pdf", fileSize: 51 * 1024 * 1024, maxUploadMb: 50 })).toMatchObject({ ok: false });
  });
});

describe("local seed database", () => {
  it("creates demo roles/content while preserving single-admin", () => {
    const db = createSeedDatabase();
    assertSingleAdmin(db.users);
    expect(db.users.map((user) => user.role).sort()).toEqual(["ADMIN", "INTERVIEW_REVIEWER", "MEMBER", "PENDING_USER"].sort());
    expect(db.posts.some((post) => post.boardType === "PUBLIC_REPORT")).toBe(true);
    expect(db.posts.some((post) => post.boardType === "TEAM_IB_OUTPUT")).toBe(true);
    expect(db.posts.some((post) => post.boardType === "INTERVIEW_REVIEW")).toBe(true);
    expect(db.attachments.every((attachment) => attachment.postId !== "post-interview-1")).toBe(true);
    expect(db.auditLogs).toHaveLength(1);
  });

  it("rejects more than one active admin", () => {
    const db = createSeedDatabase();
    expect(() => assertSingleAdmin([...db.users, { ...db.users[0], id: "user-admin-2", loginId: "admin2" }])).toThrow(/Only one active ADMIN/);
  });
});

describe("G002 auth and public route constraints", () => {
  it("validates signup without accepting team fields", async () => {
    const { validateSignup } = await import("@/lib/auth/validation");
    expect(validateSignup({ name: "홍길동", loginId: "hong_123", password: "password1", passwordConfirm: "password1" })).toEqual([]);
    expect(validateSignup({ name: "홍", loginId: "bad id", password: "short", passwordConfirm: "nope" }).length).toBeGreaterThan(0);
  });

  it("public route list excludes private member and admin routes", async () => {
    const { PUBLIC_ROUTES } = await import("@/lib/navigation/site-map");
    expect(PUBLIC_ROUTES).toContain("/recruiting");
    expect(PUBLIC_ROUTES).not.toContain("/member");
    expect(PUBLIC_ROUTES).not.toContain("/admin");
  });
});

describe("G003 board repository and storage", () => {
  it("creates a public report with route-derived board type and rejects tampered fields", async () => {
    const { saveDemoDatabase } = await import("@/lib/db/local-store");
    const { createSeedDatabase } = await import("@/lib/db/seed-data");
    const { createPost, listPosts } = await import("@/lib/db/post-repository");
    await saveDemoDatabase(createSeedDatabase());

    await expect(createPost({
      actor: { id: "user-member", role: "MEMBER" },
      boardType: "PUBLIC_REPORT",
      payload: { title: "새 공개 리포트", content: "본문", board_type: "INTERVIEW_REVIEW" },
    })).rejects.toThrow(/Forbidden post fields/);

    await expect(createPost({
      actor: { id: "user-member", role: "MEMBER" },
      boardType: "PUBLIC_REPORT",
      payload: { title: "회원 작성 시도", content: "본문" },
    })).rejects.toThrow(/접근 권한/);

    const post = await createPost({
      actor: { id: "user-admin", role: "ADMIN" },
      boardType: assertRouteBoardType("/reports/new"),
      payload: { title: "새 공개 리포트", content: "본문" },
    });
    expect(post.boardType).toBe("PUBLIC_REPORT");
    expect((await listPosts("PUBLIC_REPORT")).some((candidate) => candidate.id === post.id)).toBe(true);
  });

  it("enforces private attachment and interview attachment policy", async () => {
    const { saveDemoDatabase } = await import("@/lib/db/local-store");
    const { createSeedDatabase } = await import("@/lib/db/seed-data");
    const { addAttachment, getAttachmentForDownload } = await import("@/lib/db/post-repository");
    await saveDemoDatabase(createSeedDatabase());

    const privateAttachment = await addAttachment({
      actor: { id: "user-member", role: "MEMBER" },
      postId: "post-team-research-1",
      filename: "team.pdf",
      mimeType: "application/pdf",
      contents: "private",
    });
    await expect(getAttachmentForDownload({ actorRole: "VISITOR", attachmentId: privateAttachment.id })).rejects.toThrow(/접근 권한/);
    await expect(getAttachmentForDownload({ actorRole: "MEMBER", attachmentId: privateAttachment.id })).resolves.toMatchObject({ attachment: { id: privateAttachment.id } });

    await expect(addAttachment({
      actor: { id: "user-interview", role: "INTERVIEW_REVIEWER" },
      postId: "post-interview-1",
      filename: "interview.pdf",
      mimeType: "application/pdf",
      contents: "not allowed",
    })).rejects.toThrow(/attachments are not allowed/);
  });
});
