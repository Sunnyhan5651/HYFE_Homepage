"use client";

import { useState } from "react";
import type { CategoryOption } from "@/lib/board-policy/post-categories";
import type { PostVisibility } from "@/lib/db/schema";
import { uploadPostAttachments } from "@/lib/storage/post-attachment-client";

const VISIBILITY_OPTIONS: Array<{ value: PostVisibility; label: string }> = [
  { value: "PRIVATE", label: "비공개" },
  { value: "PUBLIC", label: "공개" },
];

export function PostEditor({
  endpoint,
  initialTitle = "",
  initialContent = "",
  initialCategory = "",
  initialCompanyType = "",
  initialVisibility = "PRIVATE",
  categoryOptions = [],
  categoryLabel = "분류",
  companyTypeOptions = [],
  allowVisibility = false,
  allowAttachments = true,
}: {
  endpoint: string;
  initialTitle?: string;
  initialContent?: string;
  initialCategory?: string | null;
  initialCompanyType?: string | null;
  initialVisibility?: PostVisibility;
  categoryOptions?: readonly CategoryOption[];
  categoryLabel?: string;
  companyTypeOptions?: readonly CategoryOption[];
  allowVisibility?: boolean;
  allowAttachments?: boolean;
}) {
  const [message, setMessage] = useState("");
  const isEdit = Boolean(initialTitle);

  return (
    <form
      className="authCard formStack"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const files = form
          .getAll("attachments")
          .filter((item): item is File => item instanceof File && item.size > 0);
        const response = await fetch(endpoint, {
          method: isEdit ? "PATCH" : "POST",
          body: JSON.stringify({
            title: form.get("title"),
            content: form.get("content"),
            category: form.get("category"),
            companyType: form.get("companyType"),
            visibility: form.get("visibility"),
          }),
          headers: { "content-type": "application/json" },
        });
        const data = await response.json();
        if (!data.ok) {
          setMessage(data.message ?? "저장에 실패했습니다.");
          return;
        }
        if (allowAttachments && files.length && data.post?.id) {
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
      {categoryOptions.length ? (
        <div className="formGroup">
          <label htmlFor="category">{categoryLabel}</label>
          <select id="category" className="select" name="category" defaultValue={initialCategory ?? ""}>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {companyTypeOptions.length ? (
        <div className="formGroup">
          <label htmlFor="companyType">회사 유형</label>
          <select id="companyType" className="select" name="companyType" defaultValue={initialCompanyType ?? ""}>
            {companyTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {allowVisibility ? (
        <div className="formGroup">
          <label htmlFor="visibility">공개 범위</label>
          <select id="visibility" className="select" name="visibility" defaultValue={initialVisibility}>
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="muted">비공개는 회원 전용, 공개는 공개 레포트의 시황 탭에도 표시됩니다.</p>
        </div>
      ) : null}
      <div className="formGroup">
        <label htmlFor="title">제목</label>
        <input id="title" className="field" name="title" defaultValue={initialTitle} required />
      </div>
      <div className="formGroup">
        <label htmlFor="content">내용</label>
        <textarea id="content" className="textarea" name="content" defaultValue={initialContent} required />
      </div>
      {allowAttachments ? (
        <div className="formGroup">
          <label htmlFor="attachments">첨부파일</label>
          <input id="attachments" className="field" name="attachments" type="file" multiple />
          <p className="muted">PDF, 이미지, 문서 파일을 업로드할 수 있습니다.</p>
        </div>
      ) : null}
      <button className="button" type="submit">
        저장
      </button>
      {message ? <p className="formMessage">{message}</p> : null}
    </form>
  );
}
