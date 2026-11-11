"use client";

import { upload } from "@vercel/blob/client";

const SERVER_UPLOAD_LIMIT_BYTES = 3.5 * 1024 * 1024;

function sanitizeFilename(filename: string): string {
  return filename.normalize("NFKC").replace(/[\\/\0]/g, "_").trim().replace(/\s+/g, "_") || "file";
}

function blobAccess(): "public" | "private" {
  const access = process.env.NEXT_PUBLIC_BLOB_ACCESS?.trim().toLowerCase();
  return access === "public" ? "public" : "private";
}

async function parseUploadResponse(response: Response): Promise<Record<string, unknown>> {
  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok || data.ok === false) throw new Error(typeof data.message === "string" ? data.message : "첨부파일 업로드에 실패했습니다.");
  return data;
}

async function uploadViaFunction(postId: string, file: File): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`/api/posts/${postId}/attachments`, {
    method: "POST",
    body: form,
  });
  await parseUploadResponse(response);
}

async function uploadDirectToBlob(postId: string, file: File): Promise<void> {
  const pathname = `posts/${postId}/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
  const blob = await upload(pathname, file, {
    access: blobAccess(),
    handleUploadUrl: `/api/posts/${postId}/attachments`,
    clientPayload: JSON.stringify({
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
    }),
    contentType: file.type || "application/octet-stream",
    multipart: true,
  });

  const response = await fetch(`/api/posts/${postId}/attachments/complete`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      storageKey: blob.pathname,
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type || blob.contentType || "application/octet-stream",
    }),
  });
  await parseUploadResponse(response);
}

export async function uploadPostAttachments(
  postId: string,
  files: File[],
  onStatus?: (message: string) => void,
): Promise<void> {
  for (const [index, file] of files.entries()) {
    onStatus?.(`첨부파일 업로드 중 (${index + 1}/${files.length})`);
    if (file.size <= SERVER_UPLOAD_LIMIT_BYTES) {
      await uploadViaFunction(postId, file);
    } else {
      await uploadDirectToBlob(postId, file);
    }
  }
}
