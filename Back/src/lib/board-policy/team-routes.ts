import type { BoardType } from "@/lib/board-policy/board-policy";

export const TEAM_ROUTE_CONFIG = {
  research: { label: "Research", koreanLabel: "리서치 팀", boardType: "TEAM_RESEARCH_OUTPUT" },
  quant: { label: "Quant", koreanLabel: "퀀트 팀", boardType: "TEAM_QUANT_OUTPUT" },
  derivatives: { label: "Derivatives", koreanLabel: "파생상품 팀", boardType: "TEAM_DERIVATIVES_OUTPUT" },
  ib: { label: "IB", koreanLabel: "IB 팀", boardType: "TEAM_IB_OUTPUT" },
} as const satisfies Record<string, { label: string; koreanLabel: string; boardType: BoardType }>;

export type TeamSlug = keyof typeof TEAM_ROUTE_CONFIG;

export function teamConfig(team: string) {
  const config = TEAM_ROUTE_CONFIG[team as TeamSlug];
  if (!config) throw new Error(`Unknown team route: ${team}`);
  return config;
}
