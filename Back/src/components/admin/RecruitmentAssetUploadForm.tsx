"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import type { RecruitmentAssetType } from "@/lib/db/schema";

function sanitizeFilename(filename: string): string {
  return filename.normalize("NFKC").replace(/[\\/\0]/g, "_").trim().replace(/\s+/g, "_") || "file";
}

export function RecruitmentAssetUploadForm({
  assetType,
  label,
  blobAccess,
}: {
  assetType: RecruitmentAssetType;
  label: string;
  blobAccess: "public" | "private";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="formStack"
      onSubmit={async (event) => {
        event.preventDefault();
        const file = inputRef.current?.files?.[0];
        if (!file) {
          setMessage("업로드할 파일을 선택해 주세요.");
          return;
        }

        setBusy(true);
        setMessage("업로드 중입니다.");
        try {
          const pathname = `recruiting/${assetType.toLowerCase()}/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
          const blob = await upload(pathname, file, {
            access: blobAccess,
            handleUploadUrl: "/api/admin/recruiting/assets",
            clientPayload: JSON.stringify({
              assetType,
              filename: file.name,
              fileSize: file.size,
              mimeType: file.type || "application/octet-stream",
            }),
            contentType: file.type || "application/octet-stream",
            multipart: file.size > 4 * 1024 * 1024,
          });

          const response = await fetch("/api/admin/recruiting/assets/complete", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              assetType,
              filename: file.name,
              fileSize: file.size,
              mimeType: file.type || blob.contentType || "application/octet-stream",
              storageKey: blob.pathname,
            }),
          });
          const data = await response.json();
          if (!data.ok) throw new Error(data.message ?? "DB 저장에 실패했습니다.");
          setMessage("업로드가 완료되었습니다.");
          window.location.href = "/admin/recruiting";
        } catch (error) {
          setMessage((error as Error).message);
          setBusy(false);
        }
      }}
    >
      <div className="formGroup">
        <label htmlFor={`${assetType}-file`}>{label} 파일</label>
        <input id={`${assetType}-file`} ref={inputRef} className="field" name="file" type="file" required disabled={busy} />
      </div>
      <button className="button" type="submit" disabled={busy}>
        {busy ? "업로드 중" : "업로드/교체"}
      </button>
      {message ? <p className="formMessage">{message}</p> : null}
    </form>
  );
}
