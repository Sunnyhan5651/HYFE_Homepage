"use client";

import Link from "next/link";
import { useState } from "react";

export function SignupForm() {
  const [message, setMessage] = useState("");

  return (
    <form
      className="formStack"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(form)),
          headers: { "content-type": "application/json" },
        });
        const data = await response.json();
        setMessage(data.message ?? data.errors?.join(", ") ?? "가입 신청을 처리했습니다.");
      }}
    >
      <div className="formGroup">
        <label htmlFor="name">이름</label>
        <input id="name" className="field" name="name" autoComplete="name" required />
      </div>
      <div className="formGroup">
        <label htmlFor="loginId">아이디</label>
        <input id="loginId" className="field" name="loginId" autoComplete="username" required />
      </div>
      <div className="formGroup">
        <label htmlFor="password">비밀번호</label>
        <input id="password" className="field" name="password" type="password" autoComplete="new-password" required />
      </div>
      <div className="formGroup">
        <label htmlFor="passwordConfirm">비밀번호 확인</label>
        <input id="passwordConfirm" className="field" name="passwordConfirm" type="password" autoComplete="new-password" required />
      </div>
      <button className="button" type="submit">
        회원가입 신청
      </button>
      {message ? <p className="formMessage">{message}</p> : null}
      <p className="muted">
        이미 계정이 있다면 <Link href="/login">로그인</Link> 페이지로 이동하세요.
      </p>
    </form>
  );
}

export function LoginForm() {
  const [message, setMessage] = useState("");

  return (
    <form
      className="formStack"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const response = await fetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(form)),
          headers: { "content-type": "application/json" },
        });
        const data = await response.json();
        setMessage(data.ok ? `${data.user.name}님으로 로그인했습니다.` : data.message);
        if (data.ok) {
          if (data.user.role === "PENDING_USER") {
            setMessage("가입 신청이 접수된 계정입니다. 관리자 승인 후 회원 메뉴를 이용할 수 있습니다.");
            return;
          }
          window.location.href = data.user.role === "ADMIN" ? "/admin" : "/member";
        }
      }}
    >
      <div className="formGroup">
        <label htmlFor="loginId">아이디</label>
        <input id="loginId" className="field" name="loginId" autoComplete="username" required />
      </div>
      <div className="formGroup">
        <label htmlFor="password">비밀번호</label>
        <input id="password" className="field" name="password" type="password" autoComplete="current-password" required />
      </div>
      <div className="metaRow">
        <span>로그인 상태 유지</span>
        <Link href="/signup">회원가입 신청</Link>
      </div>
      <button className="button" type="submit">
        로그인
      </button>
      {message ? <p className="formMessage">{message}</p> : null}
    </form>
  );
}
