import type { BoardType } from "@/lib/board-policy/board-policy";
import type { StoredRole } from "@/lib/authorization/roles";

export type UserRecord = {
  id: string;
  loginId: string;
  passwordHash: string;
  name: string;
  role: StoredRole;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  lastLoginAt: string | null;
  failedLoginCount: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type PostRecord = {
  id: string;
  boardType: BoardType;
  category: string | null;
  visibility: PostVisibility;
  companyType: string | null;
  title: string;
  content: string;
  authorId: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type PostVisibility = "PUBLIC" | "PRIVATE";

export type AttachmentRecord = {
  id: string;
  postId: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  checksum: string | null;
  uploadedBy: string;
  createdAt: string;
  deletedAt: string | null;
};

export type BannerRecord = {
  id: string;
  pageKey: string;
  desktopImageKey: string;
  mobileImageKey: string | null;
  altText: string;
  overlayOpacity: number;
  objectPosition: string;
  updatedBy: string;
  updatedAt: string;
};

export type RecruitmentAssetType = "APPLICATION_FORM" | "RECRUITING_GUIDE";

export type RecruitmentAssetRecord = {
  id: string;
  assetType: RecruitmentAssetType;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  downloadCount: number;
  isActive: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type HistoryEventRecord = {
  id: string;
  year: number;
  termLabel: string | null;
  month: number | null;
  content: string;
  isHighlight: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AlumniProfileRecord = {
  id: string;
  name: string | null;
  cohort: string | null;
  industry: string;
  company: string | null;
  roleTitle: string | null;
  profileText: string | null;
  showName: boolean;
  showCompany: boolean;
  showRoleTitle: boolean;
  consentAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type AuditAction =
  | "USER_APPROVED"
  | "USER_REJECTED"
  | "ROLE_CHANGED"
  | "POST_CREATED"
  | "POST_UPDATED"
  | "POST_DELETED"
  | "ATTACHMENT_DOWNLOADED"
  | "INTERVIEW_VIEWED"
  | "BANNER_UPDATED"
  | "APPLICATION_FORM_UPDATED"
  | "RECRUITMENT_ASSET_UPDATED";

export type AuditLogRecord = {
  id: string;
  actorId: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type DemoDatabase = {
  users: UserRecord[];
  posts: PostRecord[];
  attachments: AttachmentRecord[];
  banners: BannerRecord[];
  recruitmentAssets: RecruitmentAssetRecord[];
  historyEvents: HistoryEventRecord[];
  alumniProfiles: AlumniProfileRecord[];
  auditLogs: AuditLogRecord[];
};

export const EMPTY_DEMO_DATABASE: DemoDatabase = {
  users: [],
  posts: [],
  attachments: [],
  banners: [],
  recruitmentAssets: [],
  historyEvents: [],
  alumniProfiles: [],
  auditLogs: [],
};
