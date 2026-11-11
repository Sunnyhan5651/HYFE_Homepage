import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  const digest = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return `demo-sha256:${salt}:${digest}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [, salt, digest] = storedHash.split(":");
  if (!storedHash.startsWith("demo-sha256:") || !salt || !digest) return false;
  const candidate = hashPassword(password, salt).split(":").at(-1) ?? "";
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(digest));
}
