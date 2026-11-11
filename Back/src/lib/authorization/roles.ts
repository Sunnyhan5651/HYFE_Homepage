export const ROLE_LEVEL = {
  VISITOR: 0,
  PENDING_USER: 1,
  MEMBER: 2,
  INTERVIEW_REVIEWER: 3,
  ADMIN: 4,
} as const;

export type Role = keyof typeof ROLE_LEVEL;
export type StoredRole = Exclude<Role, "VISITOR">;

export function hasRoleAtLeast(userRole: Role, requiredRole: Role): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole];
}

export function canEditPost(params: {
  userId: string;
  userRole: Role;
  postAuthorId: string;
}): boolean {
  return params.userRole === "ADMIN" || params.userId === params.postAuthorId;
}

export function isStoredRole(role: Role): role is StoredRole {
  return role !== "VISITOR";
}
