import type { BoardType } from "@/lib/board-policy/board-policy";

const ROUTE_BOARD_MAP: Array<[RegExp, BoardType]> = [
  [/^\/reports\/recruiting(?:\/|$)/, "RECRUIT_MATERIAL"],
  [/^\/reports(?:\/|$)/, "PUBLIC_REPORT"],
  [/^\/member\/teams\/ib(?:\/|$)/, "TEAM_IB_OUTPUT"],
  [/^\/member\/teams\/research(?:\/|$)/, "TEAM_RESEARCH_OUTPUT"],
  [/^\/member\/teams\/derivatives(?:\/|$)/, "TEAM_DERIVATIVES_OUTPUT"],
  [/^\/member\/teams\/quant(?:\/|$)/, "TEAM_QUANT_OUTPUT"],
  [/^\/member\/notices(?:\/|$)/, "MEMBER_NOTICE"],
  [/^\/member\/interviews(?:\/|$)/, "INTERVIEW_REVIEW"],
  [/^\/recruiting\/materials(?:\/|$)/, "RECRUIT_MATERIAL"],
  [/^\/admin\/recruiting\/materials(?:\/|$)/, "RECRUIT_MATERIAL"],
];

export function boardTypeForRoute(pathname: string): BoardType | null {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return ROUTE_BOARD_MAP.find(([pattern]) => pattern.test(normalized))?.[1] ?? null;
}

export function assertRouteBoardType(pathname: string): BoardType {
  const boardType = boardTypeForRoute(pathname);
  if (!boardType) throw new Error(`No board type mapped for route: ${pathname}`);
  return boardType;
}
