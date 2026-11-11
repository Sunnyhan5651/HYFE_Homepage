export const banners = {
  home: "/images/banners/home.png",
  about: "/images/banners/about.png",
  curriculum: "/images/banners/curriculum.png",
  history: "/images/banners/history.png",
  reports: "/images/banners/reports.png",
  reportDetail: "/images/banners/report-detail.png",
  alumni: "/images/banners/alumni.png",
  recruiting: "/images/banners/recruiting.png",
  memberTeam: "/images/banners/member-team.png",
  interviewReview: "/images/banners/interview-review.png",
  auth: "/images/banners/auth.png",
  admin: "/images/banners/admin.png",
} as const;

export const aboutTabs = [
  { href: "/about", label: "HYFE 소개" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/history", label: "History" },
  { href: "/alumni", label: "Alumni" },
];

export const reportTabs = [
  { href: "/reports", label: "공개 레포트" },
  { href: "/reports/industry", label: "산업 리서치" },
  { href: "/reports/session", label: "세션 자료" },
  { href: "/reports/recruiting", label: "리크루팅 자료" },
];

export const recruitingTabs = [
  { href: "/recruiting", label: "모집 안내" },
  { href: "/recruiting#process", label: "지원 절차" },
  { href: "/recruiting#faq", label: "FAQ" },
];

export const memberTabs = [
  { href: "/member/teams/research", label: "팀 게시판" },
  { href: "/member/market", label: "시황" },
  { href: "/member/interviews", label: "면접 후기" },
  { href: "/member/notices", label: "공지사항" },
];

export const homeStats = [
  { icon: "R", label: "Research Sessions", value: "12+", body: "기수별 정기 리서치와 세션 운영" },
  { icon: "Q", label: "Quant & Valuation", value: "4", body: "퀀트, 밸류에이션, 전략 트랙" },
  { icon: "A", label: "Alumni Network", value: "80+", body: "금융권과 산업 전반의 선배 네트워크" },
];

export const whatWeDo = [
  { icon: "01", title: "기업 리서치", body: "개별 기업과 산업을 깊이 있게 분석합니다." },
  { icon: "02", title: "퀀트 스터디", body: "데이터와 모델을 기반으로 전략을 검증합니다." },
  { icon: "03", title: "포트폴리오 세션", body: "투자 판단과 리스크 관리를 토론합니다." },
  { icon: "04", title: "산업 세미나", body: "현업 관점의 산업 인사이트를 공유합니다." },
];

export const principles = [
  { icon: "A", title: "Analytical Rigor", subtitle: "분석적 엄밀성", body: "가설, 데이터, 검증 과정을 분리해 리서치 품질을 높입니다." },
  { icon: "M", title: "Market Insight", subtitle: "시장 통찰", body: "산업 구조와 자본시장의 변화를 함께 읽습니다." },
  { icon: "C", title: "Collaborative Research", subtitle: "협업 리서치", body: "팀 단위 토론과 피드백으로 결론을 단단하게 만듭니다." },
];

export const coreActivities = [
  { icon: "S", title: "정규 세션", body: "매주 리서치 발표와 피드백을 진행합니다." },
  { icon: "V", title: "기업 분석", body: "사업 모델, 재무제표, 밸류에이션을 연결합니다." },
  { icon: "Q", title: "퀀트 스터디", body: "Python과 통계 기반으로 투자 아이디어를 검증합니다." },
  { icon: "N", title: "알럼나이 멘토링", body: "현업 선배와 커리어 및 리서치 관점을 나눕니다." },
];

export const onboardingSteps = [
  { week: "1주차", title: "금융시장 기초", body: "시장 구조, 자산군, 투자 아이디어의 기본 언어를 학습합니다." },
  { week: "2주차", title: "재무제표와 기업분석", body: "사업보고서와 재무제표를 읽고 핵심 지표를 정리합니다." },
  { week: "3주차", title: "밸류에이션", body: "DCF, 멀티플, 민감도 분석을 통해 적정 가치를 추정합니다." },
  { week: "4주차", title: "퀀트 리서치", body: "팩터, 백테스트, 포트폴리오 기초를 실습합니다." },
  { week: "이후", title: "정규 팀 배정", body: "관심 분야에 따라 팀에 합류하고 정규 세션을 준비합니다." },
];

export const researchTracks = [
  { track: "Corporate Valuation", topic: "사업 모델, 재무제표, DCF", output: "기업 분석 리포트" },
  { track: "Quant Research", topic: "팩터, 백테스트, 데이터 처리", output: "전략 검증 노트" },
  { track: "Derivatives & Risk", topic: "파생상품, 금리, 변동성", output: "리스크 분석 자료" },
  { track: "Portfolio Strategy", topic: "자산배분, 리밸런싱, 성과 평가", output: "포트폴리오 제안서" },
];

export const historyFallback = [
  {
    year: 2025,
    term: "HYFE 14기",
    events: [
      { month: "03월", body: "신입 리크루팅 및 4주 교육 프로그램 운영" },
      { month: "05월", body: "기업분석 정규 세션과 산업 리서치 발표" },
      { month: "06월", body: "공개 리서치 리포트 발간" },
    ],
  },
  {
    year: 2024,
    term: "HYFE 13기",
    events: [
      { month: "09월", body: "하반기 리크루팅 및 팀별 온보딩" },
      { month: "10월", body: "퀀트 스터디 오픈 세션 진행" },
      { month: "11월", body: "연합 금융 세미나 개최" },
    ],
  },
  {
    year: 2023,
    term: "HYFE 12기",
    events: [
      { month: "03월", body: "금융공학 세션 커리큘럼 개편" },
      { month: "07월", body: "포트폴리오 리서치 워크숍 운영" },
      { month: "12월", body: "알럼나이 네트워킹 데이 진행" },
    ],
  },
];

export const alumniFields = [
  { label: "자산운용", value: 34 },
  { label: "증권/IB", value: 28 },
  { label: "리서치", value: 18 },
  { label: "데이터/퀀트", value: 13 },
  { label: "전략/컨설팅", value: 7 },
];

export const recruitingQualities = [
  { icon: "R", title: "Reason", subtitle: "논리적 사고", body: "근거를 세우고 검증하는 태도" },
  { icon: "I", title: "Insight", subtitle: "시장 이해", body: "기업과 산업을 연결해 보는 관점" },
  { icon: "P", title: "Persistence", subtitle: "꾸준한 학습", body: "긴 리서치 과정을 완주하는 힘" },
  { icon: "C", title: "Collaboration", subtitle: "협업 태도", body: "팀의 결론을 함께 만드는 커뮤니케이션" },
];

export const recruitingSteps = [
  { title: "온라인 지원", body: "지원서와 관심 분야를 제출합니다." },
  { title: "서류 검토", body: "리서치 관심도와 활동 가능 기간을 확인합니다." },
  { title: "인터뷰", body: "학회 활동 적합도와 협업 태도를 확인합니다." },
  { title: "신입 교육", body: "4주 교육으로 공통 리서치 언어를 맞춥니다." },
  { title: "정규 팀 배정", body: "관심 트랙에 따라 팀 활동을 시작합니다." },
];

export const teamCards = [
  { href: "/member/teams/ib", title: "IB Team", count: "5", body: "딜 구조와 시장 자료" },
  { href: "/member/teams/research", title: "Research Team", count: "8", body: "기업과 산업 분석" },
  { href: "/member/teams/derivatives", title: "Derivatives Team", count: "4", body: "금리와 파생상품" },
  { href: "/member/teams/quant", title: "Quant Team", count: "6", body: "팩터와 백테스트" },
];

export function withActive<T extends { href: string }>(links: T[], href: string): Array<T & { active: boolean }> {
  return links.map((link) => ({ ...link, active: link.href === href }));
}
