import type { BoardType } from "@/lib/board-policy/board-policy";

export type CategoryOption = {
  value: string;
  label: string;
};

export const REPORT_CATEGORY_OPTIONS = [
  { value: "market", label: "시황" },
  { value: "corporate", label: "기업분석" },
  { value: "industry", label: "산업 리서치" },
  { value: "session", label: "세션 자료" },
  { value: "quant", label: "퀀트" },
  { value: "portfolio", label: "포트폴리오" },
] as const satisfies readonly CategoryOption[];

export const TEAM_CATEGORY_OPTIONS = [
  { value: "research-note", label: "리서치 노트" },
  { value: "session-material", label: "세션 자료" },
  { value: "model", label: "모델/템플릿" },
] as const satisfies readonly CategoryOption[];

export const INTERVIEW_CATEGORY_OPTIONS = [
  { value: "asset-management", label: "자산운용" },
  { value: "securities", label: "증권" },
  { value: "ib", label: "IB" },
  { value: "research", label: "리서치" },
] as const satisfies readonly CategoryOption[];

export const INTERVIEW_COMPANY_TYPE_OPTIONS = [
  { value: "asset-manager", label: "운용사" },
  { value: "securities-firm", label: "증권사" },
  { value: "bank", label: "은행" },
  { value: "consulting", label: "컨설팅" },
  { value: "other", label: "기타" },
] as const satisfies readonly CategoryOption[];

export const RECRUIT_CATEGORY_OPTIONS = [
  { value: "guide", label: "학회 안내자료" },
  { value: "application", label: "지원서 자료" },
] as const satisfies readonly CategoryOption[];

export const NOTICE_CATEGORY_OPTIONS = [
  { value: "general", label: "일반 공지" },
  { value: "schedule", label: "일정 공지" },
] as const satisfies readonly CategoryOption[];

const CATEGORY_LABELS = new Map<string, string>(
  [
    ...REPORT_CATEGORY_OPTIONS,
    ...TEAM_CATEGORY_OPTIONS,
    ...INTERVIEW_CATEGORY_OPTIONS,
    ...INTERVIEW_COMPANY_TYPE_OPTIONS,
    ...RECRUIT_CATEGORY_OPTIONS,
    ...NOTICE_CATEGORY_OPTIONS,
    { value: "notice", label: "공지" },
  ].map((option) => [option.value, option.label]),
);

export function categoryLabel(category: string | null | undefined, fallback = "일반"): string {
  if (!category) return fallback;
  return CATEGORY_LABELS.get(category) ?? fallback;
}

export function defaultCategoryForBoard(boardType: BoardType): string | null {
  if (boardType === "PUBLIC_REPORT") return "corporate";
  if (boardType === "RECRUIT_MATERIAL") return "guide";
  if (boardType === "INTERVIEW_REVIEW") return "research";
  if (boardType === "MEMBER_NOTICE") return "general";
  if (boardType.startsWith("TEAM_")) return "session-material";
  return null;
}
