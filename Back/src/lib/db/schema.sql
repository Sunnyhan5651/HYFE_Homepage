CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  login_id TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('PENDING_USER', 'MEMBER', 'INTERVIEW_REVIEWER', 'ADMIN')),
  approved_at TEXT,
  approved_by TEXT,
  rejected_at TEXT,
  rejected_by TEXT,
  rejection_reason TEXT,
  last_login_at TEXT,
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS users_single_admin_idx
  ON users(role)
  WHERE role = 'ADMIN' AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  board_type TEXT NOT NULL CHECK (board_type IN (
    'PUBLIC_REPORT',
    'TEAM_IB_OUTPUT',
    'TEAM_RESEARCH_OUTPUT',
    'TEAM_DERIVATIVES_OUTPUT',
    'TEAM_QUANT_OUTPUT',
    'MEMBER_NOTICE',
    'INTERVIEW_REVIEW',
    'RECRUIT_MATERIAL'
  )),
  category TEXT,
  visibility TEXT NOT NULL DEFAULT 'PRIVATE' CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
  company_type TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS posts_board_created_idx
  ON posts(board_type, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS posts_public_reports_idx
  ON posts(visibility, category, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  checksum TEXT,
  uploaded_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS attachments_post_idx
  ON attachments(post_id)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  page_key TEXT UNIQUE NOT NULL,
  desktop_image_key TEXT NOT NULL,
  mobile_image_key TEXT,
  alt_text TEXT NOT NULL,
  overlay_opacity DOUBLE PRECISION NOT NULL DEFAULT 0.58,
  object_position TEXT NOT NULL DEFAULT 'center center',
  updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recruitment_assets (
  id TEXT PRIMARY KEY,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('APPLICATION_FORM', 'RECRUITING_GUIDE')),
  storage_key TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

DROP INDEX IF EXISTS recruitment_assets_single_active_application_idx;

CREATE UNIQUE INDEX IF NOT EXISTS recruitment_assets_single_active_type_idx
  ON recruitment_assets(asset_type)
  WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS history_events (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL,
  term_label TEXT,
  month INTEGER CHECK (month IS NULL OR (month >= 1 AND month <= 12)),
  content TEXT NOT NULL,
  is_highlight BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS history_events_sort_idx
  ON history_events(sort_order ASC, year DESC, month DESC);

CREATE TABLE IF NOT EXISTS alumni_profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  cohort TEXT,
  industry TEXT NOT NULL,
  company TEXT,
  role_title TEXT,
  profile_text TEXT,
  show_name BOOLEAN NOT NULL DEFAULT FALSE,
  show_company BOOLEAN NOT NULL DEFAULT FALSE,
  show_role_title BOOLEAN NOT NULL DEFAULT FALSE,
  consent_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS alumni_profiles_visible_idx
  ON alumni_profiles(created_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  action TEXT NOT NULL CHECK (action IN (
    'USER_APPROVED',
    'USER_REJECTED',
    'ROLE_CHANGED',
    'POST_CREATED',
    'POST_UPDATED',
    'POST_DELETED',
    'ATTACHMENT_DOWNLOADED',
    'INTERVIEW_VIEWED',
    'BANNER_UPDATED',
    'APPLICATION_FORM_UPDATED',
    'RECRUITMENT_ASSET_UPDATED'
  )),
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_logs_created_idx
  ON audit_logs(created_at DESC);
