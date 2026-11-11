import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import type { StorageClass } from "@/lib/board-policy/board-policy";

const PUBLIC_ROOT = process.env.LOCAL_PUBLIC_STORAGE ?? "./storage/public";
const PRIVATE_ROOT = process.env.LOCAL_PRIVATE_STORAGE ?? "./storage/private";

export function storageRoot(storage: Exclude<StorageClass, "none">): string {
  return storage === "public" ? PUBLIC_ROOT : PRIVATE_ROOT;
}

export function resolveStoragePath(storage: Exclude<StorageClass, "none">, key: string): string {
  const root = storageRoot(storage);
  const normalized = normalize(key).replace(/^(\.\.[/\\])+/, "");
  return join(root, normalized);
}

export async function writeLocalObject(storage: Exclude<StorageClass, "none">, key: string, contents: string | Uint8Array): Promise<void> {
  const path = resolveStoragePath(storage, key);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents);
}

export async function readLocalObject(storage: Exclude<StorageClass, "none">, key: string): Promise<Buffer> {
  return readFile(resolveStoragePath(storage, key));
}
