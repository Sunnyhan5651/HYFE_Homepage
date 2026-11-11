import { LoginForm } from "@/components/ui/AuthForms";
import { banners } from "@/lib/content/site-content";
import type { CSSProperties } from "react";

export default function LoginPage() {
  return (
    <main className="authPage">
      <div className="container authLayout">
        <section className="authVisual" style={{ "--banner": `url(${banners.auth})` } as CSSProperties}>
          <h1>HYFE Member Portal</h1>
          <p>학회원 전용 자료와 리서치 보드를 이용하세요.</p>
          <div className="stepTimeline" style={{ marginTop: 42 }}>
            {["팀 게시판", "시황", "면접 후기"].map((item) => (
              <div className="stepCard" key={item}>
                <b>{item}</b>
                <p>회원 권한으로 확인할 수 있습니다.</p>
                <span className="miniIcon">H</span>
              </div>
            ))}
          </div>
        </section>
        <section className="authCard">
          <h2>로그인</h2>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
