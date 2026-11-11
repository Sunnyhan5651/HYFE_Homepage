import type { StorageClass } from "@/lib/board-policy/board-policy";
import { readLocalObject, writeLocalObject } from "@/lib/storage/local-storage";

type ObjectStorageClass = Exclude<StorageClass, "none">;
type BlobAccess = "public" | "private";
export type ObjectBody = Buffer | ReadableStream<Uint8Array>;

export function shouldUseBlobStorage(): boolean {
  if (process.env.NODE_ENV === "test" || process.env.HYFE_STORAGE_ADAPTER === "local") return false;
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim() || (process.env.VERCEL_OIDC_TOKEN?.trim() && process.env.BLOB_STORE_ID?.trim()));
}

export function blobAccess(): BlobAccess {
  const access = process.env.BLOB_ACCESS?.trim().toLowerCase();
  return access === "public" || access === "private" ? access : "private";
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    chunks.push(value);
    total += value.byteLength;
  }
  return Buffer.concat(chunks, total);
}

export async function writeObject(storage: ObjectStorageClass, key: string, contents: string | Uint8Array): Promise<void> {
  if (!shouldUseBlobStorage()) {
    await writeLocalObject(storage, key, contents);
    return;
  }

  const body = typeof contents === "string" ? contents : Buffer.from(contents);
  const { put } = await import("@vercel/blob");
  await put(key, body, {
    access: blobAccess(),
    allowOverwrite: true,
  });
}

export async function readObject(storage: ObjectStorageClass, key: string): Promise<Buffer> {
  const body = await readObjectBody(storage, key);
  if (Buffer.isBuffer(body)) return body;
  return streamToBuffer(body as ReadableStream<Uint8Array>);
}

export function objectBodyToResponseBody(body: ObjectBody): BodyInit {
  return Buffer.isBuffer(body) ? new Uint8Array(body) : body;
}

export async function readObjectBody(storage: ObjectStorageClass, key: string): Promise<ObjectBody> {
  if (!shouldUseBlobStorage()) return readLocalObject(storage, key);

  const { get } = await import("@vercel/blob");
  const result = await get(key, {
    access: blobAccess(),
    useCache: false,
  });
  if (!result || result.statusCode !== 200 || !result.stream) throw new Error(`blob object not found: ${key}`);
  return result.stream;
}
