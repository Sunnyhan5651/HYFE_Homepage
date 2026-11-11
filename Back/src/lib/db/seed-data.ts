import type { DemoDatabase } from "@/lib/db/schema";
import type { PostVisibility } from "@/lib/db/schema";
import type { StoredRole } from "@/lib/authorization/roles";
import { hashPassword } from "@/lib/auth/password";
import { assertSingleAdmin, cloneEmptyDatabase } from "@/lib/db/local-store";

function now() {
  return new Date("2026-07-02T00:00:00.000Z").toISOString();
}

function user(id: string, loginId: string, role: StoredRole, name: string, password = `${loginId}1234`) {
  const approved = role === "PENDING_USER" ? null : now();
  return {
    id,
    loginId,
    passwordHash: hashPassword(password),
    name,
    role,
    approvedAt: approved,
    approvedBy: approved ? "user-admin" : null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    lastLoginAt: null,
    failedLoginCount: 0,
    lockedUntil: null,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };
}

function post(
  id: string,
  boardType: DemoDatabase["posts"][number]["boardType"],
  category: string | null,
  title: string,
  content: string,
  authorId = "user-member",
  visibility: PostVisibility = boardType === "PUBLIC_REPORT" || boardType === "RECRUIT_MATERIAL" ? "PUBLIC" : "PRIVATE",
  companyType: string | null = null,
) {
  return {
    id,
    boardType,
    category,
    visibility,
    companyType,
    title,
    content,
    authorId,
    viewCount: 120 + id.length * 11,
    downloadCount: 18 + id.length,
    createdAt: now(),
    updatedAt: now(),
    deletedAt: null,
  };
}

export function createSeedDatabase(): DemoDatabase {
  const db = cloneEmptyDatabase();

  db.users = [
    user("user-admin", "admin", "ADMIN", "관리자", "admin1234"),
    user("user-pending", "pending", "PENDING_USER", "승인대기", "pending1234"),
    user("user-member", "member", "MEMBER", "일반회원", "member1234"),
    user("user-interview", "interview", "INTERVIEW_REVIEWER", "커리어팀", "interview1234"),
  ];

  db.posts = [
    post("post-public-1", "PUBLIC_REPORT", "corporate", "AI 반도체 밸류체인 리서치", "글로벌 반도체 공급망과 국내 장비주의 투자 포인트를 분석했습니다."),
    post("post-public-2", "PUBLIC_REPORT", "corporate", "국내 은행주 밸류에이션 점검", "금리 환경과 자본비율을 바탕으로 주요 금융주의 밸류에이션을 비교했습니다."),
    post("post-public-3", "PUBLIC_REPORT", "industry", "전력 인프라 투자전략", "데이터센터 전력 수요와 송배전 설비 투자 사이클을 검토했습니다."),
    post("post-public-4", "PUBLIC_REPORT", "portfolio", "ETF 자금 흐름과 포트폴리오 전략", "섹터별 ETF 플로우와 리밸런싱 아이디어를 정리했습니다."),
    post("post-public-5", "PUBLIC_REPORT", "session", "DCF 밸류에이션 세션 노트", "신입 교육 세션에서 다룬 DCF 구조와 민감도 분석 예시를 정리했습니다."),
    post("post-public-6", "PUBLIC_REPORT", "quant", "퀀트 팩터 리서치 메모", "모멘텀, 밸류, 퀄리티 팩터를 활용한 스크리닝 결과를 공유합니다."),
    post("post-recruit-1", "RECRUIT_MATERIAL", "guide", "HYFE 학회 안내자료", "학회 활동, 커리큘럼, 리크루팅 절차를 소개하는 안내자료입니다.", "user-admin"),
    post("post-team-research-1", "TEAM_RESEARCH_OUTPUT", "research-note", "Research Team 주간 리서치 현황", "이번 주 기업분석 진행 상황과 보완 과제를 공유합니다."),
    post("post-team-quant-1", "TEAM_QUANT_OUTPUT", "model", "퀀트 팩터 백테스트 결과 공유", "모멘텀과 퀄리티 팩터의 최근 성과를 비교했습니다."),
    post("post-team-derivatives-1", "TEAM_DERIVATIVES_OUTPUT", "session-material", "금리 민감 섹터 업데이트", "국채 금리 변화와 섹터별 민감도를 점검했습니다."),
    post("post-team-ib-1", "TEAM_IB_OUTPUT", "session-material", "IB 시장 자료 업데이트", "최근 ECM과 M&A 사례를 중심으로 시장 흐름을 정리했습니다.", "user-member", "PUBLIC"),
    post("post-member-notice-1", "MEMBER_NOTICE", "general", "정기 세션 공지", "이번 주 정기 세션은 기업분석 발표와 피드백으로 진행됩니다.", "user-admin"),
    post("post-interview-1", "INTERVIEW_REVIEW", "asset-management", "자산운용 리서치 인턴 1차 면접 후기", "질문 유형, 과제 전형, 준비 과정에서 도움이 된 자료를 정리했습니다.", "user-interview", "PRIVATE", "asset-manager"),
    post("post-interview-2", "INTERVIEW_REVIEW", "research", "증권사 리서치 RA 과제전형 정리", "산업 리포트 작성 과제와 모델링 검토 방식에 대한 경험을 공유합니다.", "user-interview", "PRIVATE", "securities-firm"),
  ];

  db.attachments = [
    {
      id: "att-public-1",
      postId: "post-public-1",
      storageKey: "reports/ai-semiconductor.pdf",
      originalFilename: "HYFE_AI_Semiconductor.pdf",
      mimeType: "application/pdf",
      fileSize: 1024,
      checksum: null,
      uploadedBy: "user-member",
      createdAt: now(),
      deletedAt: null,
    },
    {
      id: "att-team-1",
      postId: "post-team-ib-1",
      storageKey: "teams/ib/market-update.pdf",
      originalFilename: "HYFE_IB_Market_Update.pdf",
      mimeType: "application/pdf",
      fileSize: 2048,
      checksum: null,
      uploadedBy: "user-member",
      createdAt: now(),
      deletedAt: null,
    },
  ];

  db.banners = [
    "home",
    "about",
    "curriculum",
    "history",
    "reports",
    "report-detail",
    "alumni",
    "recruiting",
    "member-team",
    "interview-review",
    "auth",
    "admin",
  ].map((pageKey) => ({
    id: `banner-${pageKey}`,
    pageKey,
    desktopImageKey: `images/banners/${pageKey}.png`,
    mobileImageKey: null,
    altText: `HYFE ${pageKey} banner`,
    overlayOpacity: 0.58,
    objectPosition: "center center",
    updatedBy: "user-admin",
    updatedAt: now(),
  }));

  db.recruitmentAssets = [
    {
      id: "recruit-application-1",
      assetType: "APPLICATION_FORM",
      storageKey: "recruiting/application-form.pdf",
      originalFilename: "hyfe-application-demo.pdf",
      mimeType: "application/pdf",
      fileSize: 4096,
      downloadCount: 0,
      isActive: true,
      uploadedBy: "user-admin",
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "recruit-guide-1",
      assetType: "RECRUITING_GUIDE",
      storageKey: "recruiting/recruiting-guide.pdf",
      originalFilename: "hyfe-recruiting-guide-demo.pdf",
      mimeType: "application/pdf",
      fileSize: 4096,
      downloadCount: 0,
      isActive: true,
      uploadedBy: "user-admin",
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  db.historyEvents = [
    {
      id: "history-2025-1",
      year: 2025,
      termLabel: "HYFE 14기",
      month: 3,
      content: "신입 리크루팅 및 4주 교육 프로그램 운영",
      isHighlight: true,
      sortOrder: 1,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "history-2025-2",
      year: 2025,
      termLabel: "HYFE 14기",
      month: 5,
      content: "기업분석 정규 세션과 산업 리서치 발표",
      isHighlight: false,
      sortOrder: 2,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "history-2024-1",
      year: 2024,
      termLabel: "HYFE 13기",
      month: 10,
      content: "퀀트 스터디 오픈 세션 진행",
      isHighlight: false,
      sortOrder: 3,
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  db.alumniProfiles = [
    {
      id: "alumni-demo-1",
      name: null,
      cohort: "10기",
      industry: "운용사 포트폴리오 매니저",
      company: null,
      roleTitle: null,
      profileText: "자산배분과 기업분석 관점의 멘토링을 제공합니다.",
      showName: false,
      showCompany: false,
      showRoleTitle: false,
      consentAt: null,
      createdAt: now(),
      updatedAt: now(),
      deletedAt: null,
    },
    {
      id: "alumni-demo-2",
      name: null,
      cohort: "11기",
      industry: "증권사 리서치 애널리스트",
      company: null,
      roleTitle: null,
      profileText: "산업 리서치와 보고서 작성 경험을 공유합니다.",
      showName: false,
      showCompany: false,
      showRoleTitle: false,
      consentAt: null,
      createdAt: now(),
      updatedAt: now(),
      deletedAt: null,
    },
    {
      id: "alumni-demo-3",
      name: null,
      cohort: "12기",
      industry: "핀테크 데이터 사이언티스트",
      company: null,
      roleTitle: null,
      profileText: "데이터 분석과 금융 모델링 커리어를 멘토링합니다.",
      showName: false,
      showCompany: false,
      showRoleTitle: false,
      consentAt: null,
      createdAt: now(),
      updatedAt: now(),
      deletedAt: null,
    },
  ];

  db.auditLogs = [
    {
      id: "audit-seed-1",
      actorId: "user-admin",
      action: "USER_APPROVED",
      resourceType: "user",
      resourceId: "user-member",
      ipAddress: null,
      userAgent: "seed-script",
      metadata: { localDemo: true },
      createdAt: now(),
    },
  ];

  assertSingleAdmin(db.users);
  return db;
}
