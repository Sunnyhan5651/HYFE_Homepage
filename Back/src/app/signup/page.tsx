import type { CSSProperties } from "react";
import { SignupForm } from "@/components/ui/AuthForms";
import { banners } from "@/lib/content/site-content";

export default function SignupPage() {
  return (
    <main className="authPage">
      <div className="container authLayout">
        <section className="authVisual" style={{ "--banner": `url(${banners.auth})` } as CSSProperties}>
          <h1>JOIN HYFE</h1>
          <p>가입 신청은 관리자 승인 후 완료됩니다.</p>
          <div className="summaryBox" style={{ marginTop: 42 }}>
            <h3>가입 안내</h3>
            <p className="muted">신입 학회원은 리크루팅 기간에 지원서를 제출하고, 승인 이후 회원 전용 메뉴를 이용할 수 있습니다.</p>
            <ul>
              <li>회원가입 신청 후 관리자 승인 상태로 전환됩니다.</li>
              <li>승인 전에는 공개 페이지와 리크루팅 자료만 열람할 수 있습니다.</li>
              <li>승인 완료 후 팀 게시판, 시황, 면접 후기 메뉴를 이용할 수 있습니다.</li>
            </ul>
          </div>
        </section>
        <section className="authCard">
          <h2>회원가입 신청</h2>
          <SignupForm />
        </section>
      </div>
    </main>
  );
}
