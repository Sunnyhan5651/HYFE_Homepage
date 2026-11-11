import { randomUUID } from "node:crypto";
import { TEAM_BOARD_TYPES, canReadBoard, getBoardPolicy, isTeamBoardType, type BoardType } from "@/lib/board-policy/board-policy";
import { defaultCategoryForBoard } from "@/lib/board-policy/post-categories";
import { assertNoForbiddenPostFields } from "@/lib/board-policy/validation";
import { canEditPost, hasRoleAtLeast, type Role } from "@/lib/authorization/roles";
import type { AttachmentRecord, PostRecord, PostVisibility } from "@/lib/db/schema";
import { loadDemoDatabase, saveDemoDatabase } from "@/lib/db/local-store";
import { sanitizeFilename, validateUpload } from "@/lib/storage/upload-validation";
import { writeObject } from "@/lib/storage/object-storage";

const now = () => new Date().toISOString();

type Actor = { id: string; role: Role };

export type PostListOptions = {
  category?: string | null;
  companyType?: string | null;
  visibility?: PostVisibility | null;
  q?: string | null;
};

export type PaginatedPostList = {
  posts: PostRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function postCategory(post: PostRecord): string | null {
  return post.category ?? defaultCategoryForBoard(post.boardType);
}

function postVisibility(post: PostRecord): PostVisibility {
  return post.visibility ?? defaultVisibilityForBoard(post.boardType);
}

function defaultVisibilityForBoard(boardType: BoardType): PostVisibility {
  return boardType === "PUBLIC_REPORT" || boardType === "RECRUIT_MATERIAL" ? "PUBLIC" : "PRIVATE";
}

function normalizeVisibility(boardType: BoardType, value: unknown): PostVisibility {
  if (!isTeamBoardType(boardType)) return defaultVisibilityForBoard(boardType);
  return value === "PUBLIC" ? "PUBLIC" : "PRIVATE";
}

function normalizeCompanyType(boardType: BoardType, value: unknown): string | null {
  if (boardType !== "INTERVIEW_REVIEW") return null;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function reportCategory(post: PostRecord): string | null {
  return isTeamBoardType(post.boardType) ? "market" : postCategory(post);
}

function filterPosts(posts: PostRecord[], options: PostListOptions = {}, categoryForPost: (post: PostRecord) => string | null = postCategory): PostRecord[] {
  const category = options.category?.trim() || "";
  const companyType = options.companyType?.trim() || "";
  const visibility = options.visibility ?? null;
  const query = options.q?.trim().toLowerCase() || "";
  return posts.filter((post) => {
    const effectiveCategory = categoryForPost(post);
    if (category && effectiveCategory !== category) return false;
    if (companyType && post.companyType !== companyType) return false;
    if (visibility && postVisibility(post) !== visibility) return false;
    if (!query) return true;
    return `${post.title} ${post.content} ${effectiveCategory ?? ""} ${post.companyType ?? ""}`.toLowerCase().includes(query);
  });
}

function paginate(posts: PostRecord[], page = 1, pageSize = 8): PaginatedPostList {
  const safePageSize = Math.max(1, pageSize);
  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePageSize;
  return {
    posts: posts.slice(start, start + safePageSize),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}

export async function listPosts(boardType: BoardType, options: PostListOptions = {}): Promise<PostRecord[]> {
  const db = await loadDemoDatabase();
  const posts = db.posts
    .filter((post) => post.boardType === boardType && !post.deletedAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return filterPosts(posts, options);
}

export async function listPostsByBoards(boardTypes: BoardType[], options: PostListOptions = {}): Promise<PostRecord[]> {
  const db = await loadDemoDatabase();
  const allowed = new Set(boardTypes);
  const posts = db.posts
    .filter((post) => allowed.has(post.boardType) && !post.deletedAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return filterPosts(posts, options);
}

export async function listPublicReportPosts(options: PostListOptions = {}): Promise<PostRecord[]> {
  const db = await loadDemoDatabase();
  const teamBoards = new Set<BoardType>(TEAM_BOARD_TYPES);
  const posts = db.posts
    .filter((post) => {
      if (post.deletedAt) return false;
      if (post.boardType === "PUBLIC_REPORT") return true;
      return teamBoards.has(post.boardType) && postVisibility(post) === "PUBLIC";
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return filterPosts(posts, options, reportCategory);
}

export async function listPaginatedPosts(params: {
  boardType: BoardType;
  category?: string | null;
  companyType?: string | null;
  q?: string | null;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedPostList> {
  return paginate(await listPosts(params.boardType, { category: params.category, companyType: params.companyType, q: params.q }), params.page, params.pageSize);
}

export async function listPaginatedPostsByBoards(params: {
  boardTypes: BoardType[];
  category?: string | null;
  companyType?: string | null;
  q?: string | null;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedPostList> {
  return paginate(await listPostsByBoards(params.boardTypes, { category: params.category, companyType: params.companyType, q: params.q }), params.page, params.pageSize);
}

export async function listPaginatedPublicReportPosts(params: {
  category?: string | null;
  q?: string | null;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedPostList> {
  return paginate(await listPublicReportPosts({ category: params.category, q: params.q }), params.page, params.pageSize);
}

export async function getPost(id: string): Promise<PostRecord | null> {
  const db = await loadDemoDatabase();
  return db.posts.find((post) => post.id === id && !post.deletedAt) ?? null;
}

export async function getReadablePost(params: { id: string; expectedBoardType: BoardType; actorRole: Role }): Promise<PostRecord | null> {
  const post = await getPost(params.id);
  if (!post || post.boardType !== params.expectedBoardType) return null;
  return canReadBoard(post.boardType, params.actorRole) ? post : null;
}

export async function getPublicReadablePost(id: string): Promise<PostRecord | null> {
  const post = await getPost(id);
  if (!post) return null;
  if (post.boardType === "PUBLIC_REPORT" || post.boardType === "RECRUIT_MATERIAL") return canReadBoard(post.boardType, "VISITOR") ? post : null;
  if (isTeamBoardType(post.boardType) && postVisibility(post) === "PUBLIC") return post;
  return null;
}

export async function getEditablePost(params: { id: string; expectedBoardType: BoardType; actor: Actor }): Promise<PostRecord | null> {
  const post = await getReadablePost({ id: params.id, expectedBoardType: params.expectedBoardType, actorRole: params.actor.role });
  if (!post) return null;
  return canEditPost({ userId: params.actor.id, userRole: params.actor.role, postAuthorId: post.authorId }) ? post : null;
}

export async function listAttachments(postId: string): Promise<AttachmentRecord[]> {
  const db = await loadDemoDatabase();
  return db.attachments.filter((attachment) => attachment.postId === postId && !attachment.deletedAt);
}

export async function createPost(params: {
  actor: Actor;
  boardType: BoardType;
  payload: { title?: unknown; content?: unknown } & Record<string, unknown>;
}): Promise<PostRecord> {
  assertNoForbiddenPostFields(params.payload);
  const policy = getBoardPolicy(params.boardType);
  if (!hasRoleAtLeast(params.actor.role, policy.createRole)) throw new Error("접근 권한이 없습니다.");
  if (typeof params.payload.title !== "string" || typeof params.payload.content !== "string") throw new Error("제목과 내용이 필요합니다.");

  const db = await loadDemoDatabase();
  const post: PostRecord = {
    id: randomUUID(),
    boardType: params.boardType,
    category: typeof params.payload.category === "string" && params.payload.category.trim() ? params.payload.category.trim() : defaultCategoryForBoard(params.boardType),
    visibility: normalizeVisibility(params.boardType, params.payload.visibility),
    companyType: normalizeCompanyType(params.boardType, params.payload.companyType),
    title: params.payload.title.trim(),
    content: params.payload.content.trim(),
    authorId: params.actor.id,
    viewCount: 0,
    downloadCount: 0,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };
  db.posts.push(post);
  db.auditLogs.push({
    id: randomUUID(),
    actorId: params.actor.id,
    action: "POST_CREATED",
    resourceType: "post",
    resourceId: post.id,
    ipAddress: null,
    userAgent: "local-demo",
    metadata: { boardType: post.boardType },
    createdAt: now(),
  });
  await saveDemoDatabase(db);
  return post;
}

export async function updatePost(params: { actor: Actor; id: string; payload: { title?: unknown; content?: unknown } & Record<string, unknown> }): Promise<PostRecord> {
  assertNoForbiddenPostFields(params.payload);
  const db = await loadDemoDatabase();
  const post = db.posts.find((candidate) => candidate.id === params.id && !candidate.deletedAt);
  if (!post) throw new Error("post not found");
  if (!canEditPost({ userId: params.actor.id, userRole: params.actor.role, postAuthorId: post.authorId })) throw new Error("접근 권한이 없습니다.");
  if (typeof params.payload.category === "string") post.category = params.payload.category.trim() || defaultCategoryForBoard(post.boardType);
  if (typeof params.payload.visibility === "string") post.visibility = normalizeVisibility(post.boardType, params.payload.visibility);
  if (post.boardType === "INTERVIEW_REVIEW" && Object.prototype.hasOwnProperty.call(params.payload, "companyType")) {
    post.companyType = normalizeCompanyType(post.boardType, params.payload.companyType);
  }
  if (typeof params.payload.title === "string") post.title = params.payload.title.trim();
  if (typeof params.payload.content === "string") post.content = params.payload.content.trim();
  post.updatedAt = now();
  db.auditLogs.push({
    id: randomUUID(),
    actorId: params.actor.id,
    action: "POST_UPDATED",
    resourceType: "post",
    resourceId: post.id,
    ipAddress: null,
    userAgent: "local-demo",
    metadata: {},
    createdAt: now(),
  });
  await saveDemoDatabase(db);
  return post;
}

export async function deletePost(params: { actor: Actor; id: string }): Promise<void> {
  const db = await loadDemoDatabase();
  const post = db.posts.find((candidate) => candidate.id === params.id && !candidate.deletedAt);
  if (!post) throw new Error("post not found");
  if (!canEditPost({ userId: params.actor.id, userRole: params.actor.role, postAuthorId: post.authorId })) throw new Error("접근 권한이 없습니다.");
  post.deletedAt = now();
  post.updatedAt = now();
  db.auditLogs.push({
    id: randomUUID(),
    actorId: params.actor.id,
    action: "POST_DELETED",
    resourceType: "post",
    resourceId: post.id,
    ipAddress: null,
    userAgent: "local-demo",
    metadata: {},
    createdAt: now(),
  });
  await saveDemoDatabase(db);
}

function contentLength(contents: string | Uint8Array | undefined): number {
  if (typeof contents === "string") return Buffer.byteLength(contents);
  if (contents) return contents.byteLength;
  return 0;
}

export async function addAttachment(params: { actor: Actor; postId: string; filename: string; mimeType: string; contents?: string | Uint8Array; fileSize?: number }): Promise<AttachmentRecord> {
  const db = await loadDemoDatabase();
  const post = db.posts.find((candidate) => candidate.id === params.postId && !candidate.deletedAt);
  if (!post) throw new Error("post not found");
  if (!canEditPost({ userId: params.actor.id, userRole: params.actor.role, postAuthorId: post.authorId })) throw new Error("접근 권한이 없습니다.");
  const policy = getBoardPolicy(post.boardType);
  if (!policy.allowAttachments || policy.storage === "none") throw new Error("attachments are not allowed for this board");
  const fallbackContents = "local demo attachment\n";
  const validation = validateUpload({ filename: params.filename, fileSize: params.fileSize ?? (contentLength(params.contents) || Buffer.byteLength(fallbackContents)) });
  if (!validation.ok) throw new Error(validation.reason);
  const storageKey = `${post.boardType.toLowerCase()}/${randomUUID()}-${sanitizeFilename(params.filename)}`;
  await writeObject(policy.storage, storageKey, params.contents ?? fallbackContents);
  const attachment: AttachmentRecord = {
    id: randomUUID(),
    postId: post.id,
    storageKey,
    originalFilename: sanitizeFilename(params.filename),
    mimeType: params.mimeType,
    fileSize: params.fileSize ?? (contentLength(params.contents) || Buffer.byteLength(fallbackContents)),
    checksum: null,
    uploadedBy: params.actor.id,
    createdAt: now(),
    deletedAt: null,
  };
  db.attachments.push(attachment);
  await saveDemoDatabase(db);
  return attachment;
}

export async function recordAttachmentBlob(params: {
  actor: Actor;
  postId: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  fileSize: number;
}): Promise<AttachmentRecord> {
  const db = await loadDemoDatabase();
  const post = db.posts.find((candidate) => candidate.id === params.postId && !candidate.deletedAt);
  if (!post) throw new Error("post not found");
  if (!canEditPost({ userId: params.actor.id, userRole: params.actor.role, postAuthorId: post.authorId })) throw new Error("access denied");
  const policy = getBoardPolicy(post.boardType);
  if (!policy.allowAttachments || policy.storage === "none") throw new Error("attachments are not allowed for this board");

  const validation = validateUpload({ filename: params.filename, fileSize: params.fileSize });
  if (!validation.ok) throw new Error(validation.reason);
  const prefix = `posts/${post.id}/`;
  if (!params.storageKey.startsWith(prefix)) throw new Error("invalid attachment storage key");

  const cleanFilename = sanitizeFilename(params.filename);
  let attachment = db.attachments.find((candidate) => candidate.storageKey === params.storageKey);
  if (attachment) {
    if (attachment.postId !== post.id) throw new Error("attachment storage key belongs to another post");
    attachment.originalFilename = cleanFilename;
    attachment.mimeType = params.mimeType;
    attachment.fileSize = params.fileSize;
    attachment.uploadedBy = params.actor.id;
    attachment.deletedAt = null;
  } else {
    attachment = {
      id: randomUUID(),
      postId: post.id,
      storageKey: params.storageKey,
      originalFilename: cleanFilename,
      mimeType: params.mimeType,
      fileSize: params.fileSize,
      checksum: null,
      uploadedBy: params.actor.id,
      createdAt: now(),
      deletedAt: null,
    };
    db.attachments.push(attachment);
  }

  await saveDemoDatabase(db);
  return attachment;
}

export async function getAttachmentForDownload(params: { actorRole: Role; attachmentId: string; actorId?: string | null }): Promise<{ attachment: AttachmentRecord; post: PostRecord }> {
  const db = await loadDemoDatabase();
  const attachment = db.attachments.find((candidate) => candidate.id === params.attachmentId && !candidate.deletedAt);
  if (!attachment) throw new Error("attachment not found");
  const post = db.posts.find((candidate) => candidate.id === attachment.postId && !candidate.deletedAt);
  if (!post) throw new Error("post not found");
  const policy = getBoardPolicy(post.boardType);
  if (!hasRoleAtLeast(params.actorRole, policy.readRole) && postVisibility(post) !== "PUBLIC") throw new Error("접근 권한이 없습니다.");
  post.downloadCount += 1;
  if (policy.storage === "private") {
    db.auditLogs.push({
      id: randomUUID(),
      actorId: params.actorId ?? null,
      action: "ATTACHMENT_DOWNLOADED",
      resourceType: "attachment",
      resourceId: attachment.id,
      ipAddress: null,
      userAgent: "local-demo",
      metadata: { boardType: post.boardType },
      createdAt: now(),
    });
  }
  await saveDemoDatabase(db);
  return { attachment, post };
}

export async function recordInterviewViewed(params: { actorId: string; postId: string }): Promise<void> {
  const db = await loadDemoDatabase();
  const post = db.posts.find((candidate) => candidate.id === params.postId && candidate.boardType === "INTERVIEW_REVIEW" && !candidate.deletedAt);
  if (!post) throw new Error("interview review not found");
  post.viewCount += 1;
  db.auditLogs.push({
    id: randomUUID(),
    actorId: params.actorId,
    action: "INTERVIEW_VIEWED",
    resourceType: "post",
    resourceId: post.id,
    ipAddress: null,
    userAgent: "local-demo",
    metadata: {},
    createdAt: now(),
  });
  await saveDemoDatabase(db);
}
