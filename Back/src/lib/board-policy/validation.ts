export const FORBIDDEN_POST_FIELDS = [
  "board_type",
  "boardType",
  "tag",
  "tags",
  "author_id",
  "authorId",
] as const;

export type ForbiddenPostField = (typeof FORBIDDEN_POST_FIELDS)[number];

export function findForbiddenPostFields(payload: Record<string, unknown>): ForbiddenPostField[] {
  return FORBIDDEN_POST_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(payload, field));
}

export function assertNoForbiddenPostFields(payload: Record<string, unknown>): void {
  const fields = findForbiddenPostFields(payload);
  if (fields.length) throw new Error(`Forbidden post fields: ${fields.join(", ")}`);
}
