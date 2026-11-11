import { hasRoleAtLeast, type Role } from "@/lib/authorization/roles";

export type BoardType =
  | "PUBLIC_REPORT"
  | "TEAM_IB_OUTPUT"
  | "TEAM_RESEARCH_OUTPUT"
  | "TEAM_DERIVATIVES_OUTPUT"
  | "TEAM_QUANT_OUTPUT"
  | "MEMBER_NOTICE"
  | "INTERVIEW_REVIEW"
  | "RECRUIT_MATERIAL";

export type StorageClass = "public" | "private" | "none";

export type BoardPolicy = {
  readRole: Role;
  createRole: Role;
  allowAttachments: boolean;
  storage: StorageClass;
  indexable: boolean;
  copyProtection: boolean;
};

export const BOARD_POLICY = {
  PUBLIC_REPORT: {
    readRole: "VISITOR",
    createRole: "ADMIN",
    allowAttachments: true,
    storage: "public",
    indexable: true,
    copyProtection: false,
  },
  TEAM_IB_OUTPUT: {
    readRole: "MEMBER",
    createRole: "MEMBER",
    allowAttachments: true,
    storage: "private",
    indexable: false,
    copyProtection: false,
  },
  TEAM_RESEARCH_OUTPUT: {
    readRole: "MEMBER",
    createRole: "MEMBER",
    allowAttachments: true,
    storage: "private",
    indexable: false,
    copyProtection: false,
  },
  TEAM_DERIVATIVES_OUTPUT: {
    readRole: "MEMBER",
    createRole: "MEMBER",
    allowAttachments: true,
    storage: "private",
    indexable: false,
    copyProtection: false,
  },
  TEAM_QUANT_OUTPUT: {
    readRole: "MEMBER",
    createRole: "MEMBER",
    allowAttachments: true,
    storage: "private",
    indexable: false,
    copyProtection: false,
  },
  MEMBER_NOTICE: {
    readRole: "MEMBER",
    createRole: "MEMBER",
    allowAttachments: false,
    storage: "none",
    indexable: false,
    copyProtection: false,
  },
  INTERVIEW_REVIEW: {
    readRole: "INTERVIEW_REVIEWER",
    createRole: "INTERVIEW_REVIEWER",
    allowAttachments: false,
    storage: "none",
    indexable: false,
    copyProtection: true,
  },
  RECRUIT_MATERIAL: {
    readRole: "VISITOR",
    createRole: "ADMIN",
    allowAttachments: true,
    storage: "public",
    indexable: true,
    copyProtection: false,
  },
} as const satisfies Record<BoardType, BoardPolicy>;

export const TEAM_BOARD_TYPES = [
  "TEAM_IB_OUTPUT",
  "TEAM_RESEARCH_OUTPUT",
  "TEAM_DERIVATIVES_OUTPUT",
  "TEAM_QUANT_OUTPUT",
] as const satisfies readonly BoardType[];

export function isTeamBoardType(boardType: BoardType): boolean {
  return TEAM_BOARD_TYPES.includes(boardType as (typeof TEAM_BOARD_TYPES)[number]);
}

export function getBoardPolicy(boardType: BoardType): BoardPolicy {
  return BOARD_POLICY[boardType];
}

export function canReadBoard(boardType: BoardType, userRole: Role): boolean {
  return hasRoleAtLeast(userRole, getBoardPolicy(boardType).readRole);
}
