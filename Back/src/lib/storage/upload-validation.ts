export const ALLOWED_EXTENSIONS = [
  "pdf",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "doc",
  "docx",
  "hwp",
  "hwpx",
  "jpg",
  "jpeg",
  "png",
  "webp",
] as const;

export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

const DANGEROUS_EXTENSIONS = new Set(["html", "htm", "svg", "js", "mjs", "cjs", "ts", "tsx", "jsx", "exe", "sh"]);

function configuredMaxUploadMb(): number {
  const raw = process.env.MAX_UPLOAD_MB;
  const parsed = raw ? Number(raw) : 50;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 50;
}

export function sanitizeFilename(filename: string): string {
  const normalized = filename.normalize("NFKC").replace(/[\\/\0]/g, "_").trim();
  return normalized.replace(/\s+/g, "_") || "file";
}

export function getExtension(filename: string): string {
  const sanitized = sanitizeFilename(filename);
  const dot = sanitized.lastIndexOf(".");
  return dot >= 0 ? sanitized.slice(dot + 1).toLowerCase() : "";
}

export function validateUpload(params: {
  filename: string;
  fileSize: number;
  maxUploadMb?: number;
}): { ok: true; sanitizedFilename: string; extension: AllowedExtension } | { ok: false; reason: string } {
  const sanitizedFilename = sanitizeFilename(params.filename);
  const extension = getExtension(sanitizedFilename);
  const maxBytes = (params.maxUploadMb ?? configuredMaxUploadMb()) * 1024 * 1024;

  if (params.fileSize <= 0) return { ok: false, reason: "file is empty" };
  if (params.fileSize > maxBytes) return { ok: false, reason: "file exceeds max size" };
  if (DANGEROUS_EXTENSIONS.has(extension)) return { ok: false, reason: "dangerous extension" };
  if (!ALLOWED_EXTENSIONS.includes(extension as AllowedExtension)) return { ok: false, reason: "extension not allowed" };

  return { ok: true, sanitizedFilename, extension: extension as AllowedExtension };
}
