---
name: HYFE 한양금융공학회
description: 블루아워 본관 사진과 한양블루, 절제된 편집 디자인으로 "4개 팀으로 금융 전반"을 보여주는 학회 공식 사이트
colors:
  hy-blue: "#0E4A84"
  hy-blue-hover: "#0C4176"
  hy-blue-deep: "#0A3866"
  hy-blue-night: "#061F3A"
  hy-blue-tint: "#E8EEF5"
  hy-blue-tint-2: "#D3DEEB"
  hy-orange: "#F7931E"
  ink: "#14161A"
  ink-soft: "#4A4F57"
  ink-muted: "#6B7079"
  ink-faint: "#8A8F98"
  rule: "#E4E6EA"
  rule-strong: "#C9CED6"
  paper: "#FFFFFF"
  paper-alt: "#F6F7F9"
  paper-sunk: "#EEF0F3"
  danger: "#B42318"
  success: "#1F7A4D"
typography:
  display:
    fontFamily: "Figtree, Pretendard Variable, sans-serif"  # 히어로 영문 큰 제목만
    fontSize: "clamp(2.5rem, 1.2rem + 5.2vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  h1:
    fontFamily: "Pretendard Variable, sans-serif"
    fontSize: "clamp(2rem, 1.4rem + 2.4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.028em"
  h2:
    fontFamily: "Pretendard Variable, sans-serif"
    fontSize: "clamp(1.625rem, 1.25rem + 1.5vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.028em"
  h3:
    fontFamily: "Pretendard Variable, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "-0.028em"
  body:
    fontFamily: "Pretendard Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.2em"
rounded:
  xs: "2px"
  sm: "4px"
  md: "8px"
  pill: "999px"
spacing:
  sp-1: "4px"
  sp-2: "8px"
  sp-3: "12px"
  sp-4: "16px"
  sp-5: "24px"
  sp-6: "32px"
  sp-7: "48px"
  sp-8: "64px"
  sp-9: "96px"
  sp-10: "128px"
components:
  button-primary:
    backgroundColor: "{colors.hy-blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    height: "48px"
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "{colors.hy-blue-hover}"
  button-primary-active:
    backgroundColor: "{colors.hy-blue-deep}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.hy-blue}"
    rounded: "{rounded.sm}"
    height: "48px"
  button-on-dark:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.hy-blue-deep}"
    rounded: "{rounded.sm}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "48px"
    padding: "0 16px"
  report-card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "24px"
  badge-open:
    backgroundColor: "{colors.hy-orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  table-head:
    backgroundColor: "{colors.hy-blue-tint}"
    textColor: "{colors.ink}"
---

# Design System: HYFE 한양금융공학회

> 코드 원본: `디자인시스템_v4/tokens.css`, `디자인시스템_v4/components.css`. 모든 상태는 `디자인시스템_v4/HYFE_컴포넌트_카탈로그_v4.html`에서 확인한다. 이 문서와 CSS가 다르면 CSS가 기준이다.

## Overview

레퍼런스 3곳(RISK · KUVIC · STOCKWARS)의 장점을 기능별로 골라 합친 방향이다(학습노트 4장 14번). RISK의 머리글자 강조 제목, 섹션 라벨, 스크롤 흐름. KUVIC의 리포트 결과물 카드. STOCKWARS의 팀별 서술과 모집 CTA. 첫 화면은 블루아워 본관 사진을 크게 깔고, 그 아래부터는 흰 바탕에 절제된 편집 디자인으로 이어진다. 홈·소개·리크루팅은 Persuade, 레포트·로그인·회원은 Operate 모드라 장식보다 정확함을 우선한다.

## Colors

### Primary
- **hy-blue**: 라벨, 버튼, 링크, 선택된 탭, 현재 페이지 번호. 넓은 면에는 쓰지 않는다.
- **hy-blue-deep / hy-blue-night**: 넓은 면이 필요할 때만(회원 바로가기 줄, 모집 띠, 푸터, 모바일 메뉴).
- **hy-blue-tint**: 표 머리, 팀 태그, 버튼 호버 바탕.

### Secondary
- **hy-orange**: "모집 중" 배지 하나에만. 글자는 ink.

### Neutral
- ink(제목) · ink-soft(본문) · ink-muted(메타·placeholder, 4.9:1) · ink-faint(비활성·장식 전용, 읽어야 하는 글자에 금지).

### Named Rules
- **사진 위 글자 규칙**: 블루아워 사진 위에서 H·Y·F·E는 흰색 100%, 나머지는 흰색 72%. 사진 위에 한양블루 글자를 쓰지 않는다.
- **팀 색 금지**: 4개 팀을 색으로 구분하지 않는다. 팀 태그는 모두 같은 tint 배지.

## Typography

한글 Pretendard Variable, 영문 Poppins(메뉴·라벨·숫자·버튼, 전부 대문자+자간), 히어로 영문 큰 제목만 Figtree. 큰 한글 문장은 200(얇게) + 800(강조) 대비, 소개 문단 300. 메뉴·목차 400으로 가볍게. STOCKWARS(Raleway, 첫 글자만 대문자)와 겹치지 않게 한다(2026-11-11 사용자 결정). 한글 제목 자간 -0.028em, `word-break: keep-all`, 제목은 `text-wrap: balance`. 표의 숫자는 tabular-nums.

### Hierarchy
display(히어로 영문) → h1(하위 페이지 제목) → h2(섹션 제목) → h3(카드·팀 이름) → lead → body → small(표·메타) → label(13px 대문자, 자간 0.2em).

## Layout

- 좌우 여백은 `--gutter`(16~40px) 하나, 본문 폭 최대 1200px. 섹션 위아래는 64~128px.
- 4px 단위 간격 10단계만 쓴다.
- 1440 / 1024 / 768 / 390 / 320에서 확인. 1024 아래에서 메뉴가 MENU 버튼으로, 768 아래에서 표가 한 줄 카드로, 숫자 4개가 2×2로 바뀐다.
- 한 섹션 = 한 화면 원칙은 홈·소개에만. 레포트 표·연혁 같은 긴 목록은 예외.

## Elevation & Depth

그림자는 세 단계, 모두 오프셋 + 부드러운 번짐. sh-1(기본), sh-2(카드 호버, 2px 상승과 함께), sh-3(토스트). 색 번짐(오프셋 0 halo)은 쓰지 않고, 포커스는 2px outline.

## Shapes

모서리는 2px(체크박스) · 4px(버튼·입력칸·탭·태그) · 8px(카드·토스트·빈 상태) · 원형(모집 배지) 네 가지뿐. 금융 문서답게 각진 편이다.

## Components

### Buttons
Primary / Secondary / Text(화살표 링크, 밑줄이 그려짐) × S 44 · M 48 · L 56px × Default / Hover / Pressed / Disabled / Loading. 사진·블루 위에서는 `--on-dark`(흰 버튼 + deep 글자). 문구는 동사 + 목적어("지원서 받기").

### Cards / Containers
Report Card: 윗줄 팀 태그 · 학기 → 기업명 → 제목 → 아랫줄 날짜 · PDF. 카드 전체가 링크, PDF 버튼은 따로 눌림. 카드 안에 카드 금지.

### Inputs / Fields
라벨 + 입력칸 + 도움말. Default / Focus(한양블루 테두리 2겹) / Filled / Error(빨강 + "무엇이 문제 + 어떻게 고치기") / Disabled. 검색칸은 앞 아이콘, 비밀번호칸은 보기 버튼. 체크박스는 체크 선이 그려진다.

### Navigation
흰 헤더(하위 페이지) / 사진 위 투명 헤더(홈, 스크롤 시 흰색). 영문 대문자 메뉴, 현재 페이지는 밑줄. 모바일은 3겹 패널이 차례로 들어오는 전체 화면 메뉴(400ms, 들어올 때 ease-out, 나갈 때 ease-in). 하위 페이지에는 브레드크럼, 로그인 시 회원 바로가기 줄(팀 게시판 · 시황 · 면접 후기).

### Tab · Table · Pagination
분류 탭은 밑줄 탭(옆으로 밀기), 4개 이하 기간 탭은 세그먼트. 둘 다 링크(`?category=`, `?period=`). 표는 위 2px ink 선 + tint 머리. 페이지 번호 44px 정사각형.

### Stat · Accordion · Badge · Empty · Toast
- Stat: 큰 영문 숫자 + 한글 단위(한양블루) + 대문자 라벨. 카운트업은 최종값이 보이는 상태에서 시작.
- Accordion: `<details>` 기반, 300ms ease-in-out.
- Badge: 모집 중(오렌지) / 예정(tint) / 마감(회색), 분류 태그(테두리), 팀 태그(tint).
- Empty: 점선 박스 + 아이콘 + 제목 + 다음 행동 버튼.
- Toast: 화면 아래 가운데, 제자리 페이드, 4초.

## Do's and Don'ts

### Do:
- 토큰에 있는 값만 쓴다. 새 값이 필요하면 tokens.css에 먼저 추가하고 버전을 올린다.
- 홍보자료 근거가 있는 숫자·사실만 쓴다(2007, 4개 팀, 40~50명, 450여 명).
- 등장 효과가 실패해도 글이 처음부터 보이게 한다. `prefers-reduced-motion`이면 움직임 0.

### Don't:
- 히어로 제목 바로 위의 작은 대문자 라벨(eyebrow). 사실은 소개 문장 안에 넣는다.
- 그라데이션 글자, 장식용 유리·블러, 색 halo 그림자, 두꺼운 왼쪽 색 테두리.
- 섹션마다 페이드인(히어로 입장과 숫자 카운트업에만 움직임).
- 이모지·유니코드 기호를 아이콘 대신 쓰기(직접 그린 SVG, 선 굵기 1.75).
- 공개 페이지에 개인 연락처, 지어낸 후기·로고·수치.
- 보라색, 레퍼런스 학회의 크림슨.
