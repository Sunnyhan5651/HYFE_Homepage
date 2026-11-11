import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { rejectCrossOriginMutation } from "@/lib/auth/csrf";
import { getSessionUser } from "@/lib/auth/session";
import { ROLE_LEVEL, canEditPost, type Role } from "@/lib/authorization/roles";
import { canReadBoard, getBoardPolicy } from "@/lib/board-policy/board-policy";
import { addAttachment, getPost, listAttachments, recordAttachmentBlob } from "@/lib/db/post-repository";
import { validateUpload } from "@/lib/storage/upload-validation";

type UploadPayload = {
  actorId?: unknown;
  actorRole?: unknown;
  postId?: unknown;
  filename: unknown;
  fileSize: unknown;
  mimeType: unknown;
};

function isBlobUploadBody(body: unknown): body is HandleUploadBody {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as { type?: unknown }).type === "string" &&
    (body as { type: string }).type.startsWith("blob.")
  );
}

function isRole(value: unknown): value is Role {
  return typeof value === "string" && value in ROLE_LEVEL;
}

function parseUploadPayload(payload: string | null): UploadPayload {
  if (!payload) throw new Error("missing upload metadata");
  return JSON.parse(payload) as UploadPayload;
}

function safeMimeType(value: unknown): string {
  return typeof value === "string" && value ? value : "application/octet-stream";
}

async function assertCanAttach(params: {
  actorId: string;
  actorRole: Role;
  postId: string;
  filename: string;
  fileSize: number;
  pathname: string;
}) {
  const validation = validateUpload({ filename: params.filename, fileSize: params.fileSize });
  if (!validation.ok) throw new Error(validation.reason);

  const post = await getPost(params.postId);
  if (!post) throw new Error("post not found");
  if (!canEditPost({ userId: params.actorId, userRole: params.actorRole, postAuthorId: post.authorId })) throw new Error("access denied");

  const policy = getBoardPolicy(post.boardType);
  if (!policy.allowAttachments || policy.storage === "none") throw new Error("attachments are not allowed for this board");

  const prefix = `posts/${params.postId}/`;
  if (!params.pathname.startsWith(prefix)) throw new Error("invalid attachment storage key");
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const post = await getPost(id);
  if (!post) return NextResponse.json({ ok: false, message: "post not found" }, { status: 404 });
  const user = await getSessionUser();
  if (!canReadBoard(post.boardType, user?.role ?? "VISITOR")) return NextResponse.json({ ok: false, message: "접근 권한이 없습니다." }, { status: 403 });
  return NextResponse.json({ ok: true, attachments: await listAttachments(id) });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const csrf = rejectCrossOriginMutation(request);
  if (csrf) return csrf;
  const { id } = await context.params;

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const user = await getSessionUser();
      if (!user) return NextResponse.json({ ok: false, message: "회원 전용 페이지입니다. 로그인 후 이용해주세요." }, { status: 401 });

      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return NextResponse.json({ ok: false, message: "첨부파일이 필요합니다." }, { status: 400 });
      const attachment = await addAttachment({
        actor: { id: user.id, role: user.role },
        postId: id,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        contents: new Uint8Array(await file.arrayBuffer()),
        fileSize: file.size,
      });
      return NextResponse.json({ ok: true, attachment });
    }

    const body = (await request.json()) as unknown;
    if (isBlobUploadBody(body)) {
      const response = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          const actor = await getSessionUser();
          if (!actor) throw new Error("login required");

          const payload = parseUploadPayload(clientPayload);
          if (typeof payload.filename !== "string") throw new Error("invalid filename");
          const fileSize = Number(payload.fileSize);
          if (!Number.isFinite(fileSize)) throw new Error("invalid file size");

          await assertCanAttach({
            actorId: actor.id,
            actorRole: actor.role,
            postId: id,
            filename: payload.filename,
            fileSize,
            pathname,
          });

          return {
            addRandomSuffix: false,
            allowOverwrite: false,
            maximumSizeInBytes: fileSize,
            tokenPayload: JSON.stringify({
              actorId: actor.id,
              actorRole: actor.role,
              postId: id,
              filename: payload.filename,
              fileSize,
              mimeType: safeMimeType(payload.mimeType),
            }),
          };
        },
        onUploadCompleted: async ({ blob, tokenPayload }) => {
          const payload = parseUploadPayload(tokenPayload ?? null);
          if (typeof payload.actorId !== "string") throw new Error("invalid actor");
          if (!isRole(payload.actorRole)) throw new Error("invalid actor role");
          if (payload.postId !== id) throw new Error("invalid post id");
          if (typeof payload.filename !== "string") throw new Error("invalid filename");
          const fileSize = Number(payload.fileSize);
          if (!Number.isFinite(fileSize)) throw new Error("invalid file size");

          await recordAttachmentBlob({
            actor: { id: payload.actorId, role: payload.actorRole },
            postId: id,
            storageKey: blob.pathname,
            filename: payload.filename,
            mimeType: typeof payload.mimeType === "string" && payload.mimeType ? payload.mimeType : blob.contentType || "application/octet-stream",
            fileSize,
          });
        },
      });
      return NextResponse.json(response);
    }

    const user = await getSessionUser();
    if (!user) return NextResponse.json({ ok: false, message: "회원 전용 페이지입니다. 로그인 후 이용해주세요." }, { status: 401 });

    const payload = body as Record<string, unknown>;
    const attachment = await addAttachment({
      actor: { id: user.id, role: user.role },
      postId: id,
      filename: String(payload.filename ?? ""),
      mimeType: typeof payload.mimeType === "string" ? payload.mimeType : "application/octet-stream",
      contents: typeof payload.contents === "string" ? payload.contents : undefined,
      fileSize: typeof payload.fileSize === "number" ? payload.fileSize : Number(payload.fileSize),
    });
    return NextResponse.json({ ok: true, attachment });
  } catch (error) {
    return NextResponse.json({ ok: false, message: (error as Error).message }, { status: 400 });
  }
}
