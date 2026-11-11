import { query, transaction } from "@/lib/db/postgres";
import type {
  AlumniProfileRecord,
  AttachmentRecord,
  AuditLogRecord,
  BannerRecord,
  DemoDatabase,
  HistoryEventRecord,
  PostRecord,
  RecruitmentAssetRecord,
  UserRecord,
} from "@/lib/db/schema";

type NumericValue = number | string;

type UserRow = {
  id: string;
  login_id: string;
  password_hash: string;
  name: string;
  role: UserRecord["role"];
  approved_at: string | null;
  approved_by: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
  last_login_at: string | null;
  failed_login_count: NumericValue;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type PostRow = {
  id: string;
  board_type: PostRecord["boardType"];
  category: string | null;
  visibility: PostRecord["visibility"];
  company_type: string | null;
  title: string;
  content: string;
  author_id: string;
  view_count: NumericValue;
  download_count: NumericValue;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type AttachmentRow = {
  id: string;
  post_id: string;
  storage_key: string;
  original_filename: string;
  mime_type: string;
  file_size: NumericValue;
  checksum: string | null;
  uploaded_by: string;
  created_at: string;
  deleted_at: string | null;
};

type BannerRow = {
  id: string;
  page_key: string;
  desktop_image_key: string;
  mobile_image_key: string | null;
  alt_text: string;
  overlay_opacity: NumericValue;
  object_position: string;
  updated_by: string;
  updated_at: string;
};

type RecruitmentAssetRow = {
  id: string;
  asset_type: RecruitmentAssetRecord["assetType"];
  storage_key: string;
  original_filename: string;
  mime_type: string;
  file_size: NumericValue;
  download_count: NumericValue;
  is_active: boolean;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
};

type HistoryEventRow = {
  id: string;
  year: NumericValue;
  term_label: string | null;
  month: NumericValue | null;
  content: string;
  is_highlight: boolean;
  sort_order: NumericValue;
  created_at: string;
  updated_at: string;
};

type AlumniProfileRow = {
  id: string;
  name: string | null;
  cohort: string | null;
  industry: string;
  company: string | null;
  role_title: string | null;
  profile_text: string | null;
  show_name: boolean;
  show_company: boolean;
  show_role_title: boolean;
  consent_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type AuditLogRow = {
  id: string;
  actor_id: string | null;
  action: AuditLogRecord["action"];
  resource_type: string;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: unknown;
  created_at: string;
};

function toNumber(value: NumericValue | null): number | null {
  if (value === null) return null;
  return typeof value === "number" ? value : Number(value);
}

function toMetadata(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function rowToUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    loginId: row.login_id,
    passwordHash: row.password_hash,
    name: row.name,
    role: row.role,
    approvedAt: row.approved_at,
    approvedBy: row.approved_by,
    rejectedAt: row.rejected_at,
    rejectedBy: row.rejected_by,
    rejectionReason: row.rejection_reason,
    lastLoginAt: row.last_login_at,
    failedLoginCount: toNumber(row.failed_login_count) ?? 0,
    lockedUntil: row.locked_until,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function rowToPost(row: PostRow): PostRecord {
  return {
    id: row.id,
    boardType: row.board_type,
    category: row.category,
    visibility: row.visibility,
    companyType: row.company_type,
    title: row.title,
    content: row.content,
    authorId: row.author_id,
    viewCount: toNumber(row.view_count) ?? 0,
    downloadCount: toNumber(row.download_count) ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function rowToAttachment(row: AttachmentRow): AttachmentRecord {
  return {
    id: row.id,
    postId: row.post_id,
    storageKey: row.storage_key,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    fileSize: toNumber(row.file_size) ?? 0,
    checksum: row.checksum,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

function rowToBanner(row: BannerRow): BannerRecord {
  return {
    id: row.id,
    pageKey: row.page_key,
    desktopImageKey: row.desktop_image_key,
    mobileImageKey: row.mobile_image_key,
    altText: row.alt_text,
    overlayOpacity: toNumber(row.overlay_opacity) ?? 0,
    objectPosition: row.object_position,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
  };
}

function rowToRecruitmentAsset(row: RecruitmentAssetRow): RecruitmentAssetRecord {
  return {
    id: row.id,
    assetType: row.asset_type,
    storageKey: row.storage_key,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    fileSize: toNumber(row.file_size) ?? 0,
    downloadCount: toNumber(row.download_count) ?? 0,
    isActive: row.is_active,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToHistoryEvent(row: HistoryEventRow): HistoryEventRecord {
  return {
    id: row.id,
    year: toNumber(row.year) ?? 0,
    termLabel: row.term_label,
    month: toNumber(row.month),
    content: row.content,
    isHighlight: row.is_highlight,
    sortOrder: toNumber(row.sort_order) ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToAlumniProfile(row: AlumniProfileRow): AlumniProfileRecord {
  return {
    id: row.id,
    name: row.name,
    cohort: row.cohort,
    industry: row.industry,
    company: row.company,
    roleTitle: row.role_title,
    profileText: row.profile_text,
    showName: row.show_name,
    showCompany: row.show_company,
    showRoleTitle: row.show_role_title,
    consentAt: row.consent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function rowToAuditLog(row: AuditLogRow): AuditLogRecord {
  return {
    id: row.id,
    actorId: row.actor_id,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    metadata: toMetadata(row.metadata),
    createdAt: row.created_at,
  };
}

export async function loadPostgresDatabase(): Promise<DemoDatabase> {
  const [users, posts, attachments, banners, recruitmentAssets, historyEvents, alumniProfiles, auditLogs] = await Promise.all([
    query<UserRow>("SELECT * FROM users ORDER BY created_at ASC, id ASC"),
    query<PostRow>("SELECT * FROM posts ORDER BY created_at ASC, id ASC"),
    query<AttachmentRow>("SELECT * FROM attachments ORDER BY created_at ASC, id ASC"),
    query<BannerRow>("SELECT * FROM banners ORDER BY page_key ASC, id ASC"),
    query<RecruitmentAssetRow>("SELECT * FROM recruitment_assets ORDER BY created_at ASC, id ASC"),
    query<HistoryEventRow>("SELECT * FROM history_events ORDER BY sort_order ASC, year DESC, month DESC NULLS LAST, id ASC"),
    query<AlumniProfileRow>("SELECT * FROM alumni_profiles ORDER BY created_at ASC, id ASC"),
    query<AuditLogRow>("SELECT * FROM audit_logs ORDER BY created_at ASC, id ASC"),
  ]);

  return {
    users: users.map(rowToUser),
    posts: posts.map(rowToPost),
    attachments: attachments.map(rowToAttachment),
    banners: banners.map(rowToBanner),
    recruitmentAssets: recruitmentAssets.map(rowToRecruitmentAsset),
    historyEvents: historyEvents.map(rowToHistoryEvent),
    alumniProfiles: alumniProfiles.map(rowToAlumniProfile),
    auditLogs: auditLogs.map(rowToAuditLog),
  };
}

export async function savePostgresDatabase(database: DemoDatabase): Promise<void> {
  await transaction(async (client) => {
    await client.query("DELETE FROM audit_logs");
    await client.query("DELETE FROM attachments");
    await client.query("DELETE FROM recruitment_assets");
    await client.query("DELETE FROM banners");
    await client.query("DELETE FROM history_events");
    await client.query("DELETE FROM alumni_profiles");
    await client.query("DELETE FROM posts");
    await client.query("DELETE FROM users");

    for (const user of database.users) {
      await client.query(
        `INSERT INTO users (
          id, login_id, password_hash, name, role, approved_at, approved_by, rejected_at,
          rejected_by, rejection_reason, last_login_at, failed_login_count, locked_until,
          created_at, updated_at, deleted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          user.id,
          user.loginId,
          user.passwordHash,
          user.name,
          user.role,
          user.approvedAt,
          user.approvedBy,
          user.rejectedAt,
          user.rejectedBy,
          user.rejectionReason,
          user.lastLoginAt,
          user.failedLoginCount,
          user.lockedUntil,
          user.createdAt,
          user.updatedAt,
          user.deletedAt,
        ],
      );
    }

    for (const post of database.posts) {
      await client.query(
        `INSERT INTO posts (
          id, board_type, category, visibility, company_type, title, content, author_id,
          view_count, download_count, created_at, updated_at, deleted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          post.id,
          post.boardType,
          post.category,
          post.visibility,
          post.companyType,
          post.title,
          post.content,
          post.authorId,
          post.viewCount,
          post.downloadCount,
          post.createdAt,
          post.updatedAt,
          post.deletedAt,
        ],
      );
    }

    for (const attachment of database.attachments) {
      await client.query(
        `INSERT INTO attachments (
          id, post_id, storage_key, original_filename, mime_type, file_size, checksum,
          uploaded_by, created_at, deleted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          attachment.id,
          attachment.postId,
          attachment.storageKey,
          attachment.originalFilename,
          attachment.mimeType,
          attachment.fileSize,
          attachment.checksum,
          attachment.uploadedBy,
          attachment.createdAt,
          attachment.deletedAt,
        ],
      );
    }

    for (const banner of database.banners) {
      await client.query(
        `INSERT INTO banners (
          id, page_key, desktop_image_key, mobile_image_key, alt_text, overlay_opacity,
          object_position, updated_by, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          banner.id,
          banner.pageKey,
          banner.desktopImageKey,
          banner.mobileImageKey,
          banner.altText,
          banner.overlayOpacity,
          banner.objectPosition,
          banner.updatedBy,
          banner.updatedAt,
        ],
      );
    }

    for (const asset of database.recruitmentAssets) {
      await client.query(
        `INSERT INTO recruitment_assets (
          id, asset_type, storage_key, original_filename, mime_type, file_size,
          download_count, is_active, uploaded_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          asset.id,
          asset.assetType,
          asset.storageKey,
          asset.originalFilename,
          asset.mimeType,
          asset.fileSize,
          asset.downloadCount,
          asset.isActive,
          asset.uploadedBy,
          asset.createdAt,
          asset.updatedAt,
        ],
      );
    }

    for (const event of database.historyEvents) {
      await client.query(
        `INSERT INTO history_events (
          id, year, term_label, month, content, is_highlight, sort_order, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [event.id, event.year, event.termLabel, event.month, event.content, event.isHighlight, event.sortOrder, event.createdAt, event.updatedAt],
      );
    }

    for (const profile of database.alumniProfiles) {
      await client.query(
        `INSERT INTO alumni_profiles (
          id, name, cohort, industry, company, role_title, profile_text, show_name,
          show_company, show_role_title, consent_at, created_at, updated_at, deleted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          profile.id,
          profile.name,
          profile.cohort,
          profile.industry,
          profile.company,
          profile.roleTitle,
          profile.profileText,
          profile.showName,
          profile.showCompany,
          profile.showRoleTitle,
          profile.consentAt,
          profile.createdAt,
          profile.updatedAt,
          profile.deletedAt,
        ],
      );
    }

    for (const log of database.auditLogs) {
      await client.query(
        `INSERT INTO audit_logs (
          id, actor_id, action, resource_type, resource_id, ip_address, user_agent, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)`,
        [
          log.id,
          log.actorId,
          log.action,
          log.resourceType,
          log.resourceId,
          log.ipAddress,
          log.userAgent,
          JSON.stringify(log.metadata ?? {}),
          log.createdAt,
        ],
      );
    }
  });
}
