"use client";

import { useState } from "react";
import { uploadPostAttachments } from "@/lib/storage/post-attachment-client";

const TEAM_OPTIONS = [
  { value: "ib", label: "IB 팀" },
  { value: "research", label: "리서치 팀" },
  { value: "derivatives", label: "파생상품 팀" },
  { value: "quant", label: "퀀트 팀" },
] as const;

export function MarketPostEditor() {
  const [message, setMessage] = useState("");

  return (
    <form
      className="authCard formStack"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const files = form
          .getAll("attachments")
          .filter((item): item is File => item instanceof File && item.size > 0);
        const response = await fetch("/api/member/market", {
          method: "POST",
          body: JSON.stringify({
            team: form.get("team"),
            visibility: form.get("visibility"),
            title: form.get("title"),
            content: form.get("content"),
          }),
          headers: { "content-type": "application/json" },
        });
        const data = await response.json();
        if (!data.ok) {
          setMessage(data.message ?? "저장에 실패했습니다.");
          return;
        }
        if (files.length && data.post?.id) {
          try {
            await uploadPostAttachments(data.post.id, files, setMessage);
          } catch (error) {
            setMessage(`게시글은 저장됐지만 첨부파일 업로드에 실패했습니다: ${(error as Error).message}`);
            return;
          }
        }
        setMessage("저장되었습니다.");
      }}
    >
      <div className="formGroup">
        <label htmlFor="team">팀</label>
        <select id="team" className="select" name="team" defaultValue="ib">
          {TEAM_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="formGroup">
        <label htmlFor="visibility">공개 범위</label>
        <select id="visibility" className="select" name="visibility" defaultValue="PRIVATE">
          <option value="PRIVATE">비공개</option>
          <option value="PUBLIC">공개</option>
        </select>
        <p className="muted">공개로 저장하면 공개 레포트의 시황 탭에도 표시됩니다.</p>
      </div>
      <div className="formGroup">
        <label htmlFor="title">제목</label>
        <input id="title" className="field" name="title" required />
      </div>
      <div className="formGroup">
        <label htmlFor="content">내용</label>
        <textarea id="content" className="textarea" name="content" required />
      </div>
      <div className="formGroup">
        <label htmlFor="attachments">첨부파일</label>
        <input id="attachments" className="field" name="attachments" type="file" multiple />
        <p className="muted">PDF, 이미지, 문서 파일을 업로드할 수 있습니다.</p>
      </div>
      <button className="button" type="submit">
        저장
      </button>
      {message ? <p className="formMessage">{message}</p> : null}
    </form>
  );
}
