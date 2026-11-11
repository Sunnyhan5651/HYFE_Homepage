import Link from "next/link";

export function AccessNotice({
  title = "로그인이 필요합니다",
  message,
  linkHref = "/login",
  linkLabel = "로그인",
}: {
  title?: string;
  message: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <main className="section">
      <div className="container">
        <div className="noteBox">
          <h2>{title}</h2>
          <p className="muted">{message}</p>
          <div className="actionRow">
            <Link className="button" href={linkHref}>
              {linkLabel}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
