import { createHmac, timingSafeEqual } from "node:crypto";

const VERSION = "demo-v1";
const DEFAULT_TTL_MS = 8 * 60 * 60 * 1000;

function secret(): string {
  return process.env.AUTH_SECRET ?? "local-demo-session-secret";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createSessionToken(userId: string, expiresAtMs = Date.now() + DEFAULT_TTL_MS): string {
  const payload = `${VERSION}:${encodeURIComponent(userId)}:${expiresAtMs}`;
  return `${payload}:${sign(payload)}`;
}

export function verifySessionToken(token: string, nowMs = Date.now()): string | null {
  const [version, encodedUserId, expiresAt, signature, ...extra] = token.split(":");
  if (extra.length || version !== VERSION || !encodedUserId || !expiresAt || !signature) return null;
  const expiresAtMs = Number(expiresAt);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= nowMs) return null;
  const payload = `${version}:${encodedUserId}:${expiresAt}`;
  if (!safeEqual(sign(payload), signature)) return null;
  return decodeURIComponent(encodedUserId);
}

