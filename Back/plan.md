# 한양대 금융학회 홈페이지 개발 계획서 / PRD / Codex Implementation Plan

> 목적: 본 문서는 첨부된 학회 홈페이지 레퍼런스 HTML, 기존 개발 계획, 수정 요구사항을 통합한 최종 `plan.md`이다. Codex가 이 문서를 기준으로 PRD, 상세 작업 계획, 구현 태스크, QA 체크리스트를 생성하고 실제 개발을 진행할 수 있도록 정보구조, 권한, 디자인, DB, API, 보안, 운영 요구사항을 구체화한다.

---

## 0. 문서 메타데이터

| 항목 | 값 |
|---|---|
| 문서명 | 한양대 금융학회 홈페이지 개발 계획서 |
| 버전 | v1.0-final-plan |
| 작성 기준일 | 2026-07-02 |
| 주 사용처 | Codex 개발 지시서, PRD 초안, 상세 구현 계획, QA 기준 |
| 입력 자료 | 사용자 요구사항, 수정 요구사항, 레퍼런스 HTML 6개 |
| 핵심 방향 | 공개 홍보 사이트 + 공개 리포트 아카이브 + 회원 전용 자료실 + 제한 회원용 면접 후기 아카이브 + 단일 관리자 CMS |

---

## 1. 수정 요구사항 최종 반영 내역

아래 항목은 반드시 구현에 반영한다. 이후 문서 전반의 모든 요구사항은 이 결정에 종속된다.

### 1.1 권한 단순화

기존 계획의 팀별 권한은 전부 삭제한다.

```txt
삭제:
- TEAM_MEMBER_IB
- TEAM_MEMBER_RESEARCH
- TEAM_MEMBER_DERIVATIVES
- TEAM_MEMBER_QUANT
- SUPER_ADMIN
- user.team
- 팀별 업로드 제한
- 팀별 열람 제한
```

최종 role은 다음 5개만 사용한다.

```ts
type Role =
  | "VISITOR"            // DB 저장 안 함. 비로그인 상태.
  | "PENDING_USER"       // 회원가입 요청 후 관리자 승인 전.
  | "MEMBER"             // 승인 회원.
  | "INTERVIEW_REVIEWER" // MEMBER 권한 + 면접 후기 권한.
  | "ADMIN";             // 회장 1명. 최고 관리자. super admin과 동일.
```

### 1.2 admin = super admin

관리자 계정은 회장 1명에게만 부여된다. 따라서 `ADMIN`과 `SUPER_ADMIN`을 분리하지 않는다.

앱 내부 권한은 `ADMIN` 하나로 끝낸다. 단, DB/호스팅/스토리지 복구 권한은 앱 role과 별개의 인프라 운영 권한이다.

### 1.3 한양대 블루 기반 디자인

핵심 색상:

```css
:root {
  --hy-blue: #1D2475;
  --hy-blue-dark: #111853;
  --hy-blue-deep: #080D2B;
  --hy-gray: #3F3D42;
  --hy-silver: #939396;
  --hy-gold: #AB863F;
  --paper: #FFFFFF;
  --muted: #F5F7FB;
  --line: #E5E8F0;
  --text: #111827;
  --text-muted: #6B7280;
}
```

### 1.4 Home 최근 공개 리포트 삭제

Home에는 최신 공개 리포트 리스트, 최근 공개 리포트 카드, 다운로드 랭킹을 넣지 않는다.

허용되는 것은 단순 CTA 버튼뿐이다.

```txt
허용:
- 공개 리포트 페이지로 이동하는 버튼

금지:
- 최근 공개 리포트 목록
- 최신 리포트 카드
- 다운로드 순위
- 조회수 순위
```

### 1.5 지원서는 파일 다운로드 방식만 허용

리크루팅 지원 방식은 파일 다운로드 1개로 고정한다.

```txt
허용:
- 지원서 파일 다운로드

금지:
- Google Form
- Typeform
- Notion form
- 외부 지원 링크
- 지원서 작성 웹폼
```

### 1.6 회원 전용 팀 페이지는 게시판만

회원 전용 팀 페이지는 회원만 보는 내부 자료실이므로 팀 소개와 커리큘럼 요약을 넣지 않는다.

```txt
/member/teams/ib
/member/teams/research
/member/teams/derivatives
/member/teams/quant

각 페이지 구성:
- Hero
- Breadcrumb
- Member sub navigation
- 게시판 제목
- 게시판 목록
- 검색
- 페이지네이션
- 글쓰기 버튼
```

### 1.7 면접 후기는 제목/내용만

면접 후기는 구조화 필드를 두지 않는다. 작성자가 본문에서 자유롭게 작성한다.

```txt
필드:
- title
- content

삭제:
- 회사/직무
- 연도
- 전형 단계
- 면접 방식
- 질문 목록
- 답변 메모
- 난이도
- 결과
- 첨부파일
- 카테고리
- 태그
- visibility
```

### 1.8 회원가입에서 팀 정보 삭제

회원가입은 팀 정보를 받지 않는다. 회원은 이후 팀이 바뀔 수 있고, 팀별 권한을 쓰지 않으므로 DB에도 팀 필드를 두지 않는다.

```txt
회원가입 필드:
- 이름
- ID
- 비밀번호
- 비밀번호 확인
```

### 1.9 글 작성은 페이지 하단 버튼에서 시작

글 작성은 해당 게시판 페이지에 접근한 뒤 표 하단의 `글쓰기` 버튼을 눌러 시작한다. 글쓰기 진입 시 `board_type`은 route 기준으로 서버가 자동 고정한다.

```txt
사용자는 선택하지 않는다:
- board_type
- category
- tag
- visibility
```

예시:

```txt
/reports 하단 [글쓰기]
→ /reports/new
→ 서버 고정 board_type = PUBLIC_REPORT

/member/interviews 하단 [글쓰기]
→ /member/interviews/new
→ 서버 고정 board_type = INTERVIEW_REVIEW
```

### 1.10 면접 후기 복사 억제

면접 후기 목록/상세 페이지에 한해서 텍스트 드래그, 우클릭, 복사, `Ctrl+C`, `Ctrl+A`, `Ctrl+P`, `Ctrl+S` 차단을 적용한다.

이는 보안이 아니라 유출 억제 UX다. 서버 권한검사, noindex, private cache 차단, audit log가 본체다.

---

## 2. 레퍼런스 HTML에서 가져올 구조적 패턴

레퍼런스는 그대로 복제하지 않는다. 구조와 UX 패턴만 가져오고, 컬러·이미지·카피·로고·브랜드는 한양대 금융학회에 맞게 재설계한다.

### 2.1 Global Header / Mobile Drawer

레퍼런스는 상단에 로고, 주요 메뉴, `JOIN`, `LOGIN`을 두고, 모바일에서는 hamburger icon과 overlay menu를 사용한다.

우리 사이트 적용:

```txt
Desktop Header:
- 왼쪽: 학회 로고
- 중앙: ABOUT / REPORTS / RECRUITING / MEMBER
- 오른쪽: JOIN / LOGIN 또는 사용자명 / LOGOUT

Mobile Header:
- 왼쪽: 로고
- 오른쪽: hamburger
- drawer: 주요 메뉴 + JOIN/LOGIN 또는 LOGOUT
```

### 2.2 Sub Hero + Breadcrumb

레퍼런스는 각 하위 페이지에서 `sub-top` 영역에 배너 이미지를 깔고, 중앙에 영문 대제목과 breadcrumb를 둔다.

우리 사이트 적용:

```txt
SubHero:
- pageKey별 배너 이미지
- desktop/mobile 이미지 분리 가능
- 어두운 blue overlay
- 중앙 영문 대제목
- breadcrumb
```

### 2.3 2단 Sub Menu

레퍼런스는 상단 hero 아래에 대분류 dropdown과 현재 대분류 내 하위 페이지 dropdown을 둔다.

우리 사이트 적용:

```txt
SubNavigation:
- 1단: 현재 대분류
- 2단: 현재 대분류 내 하위 페이지
- desktop: dropdown bar
- mobile: horizontal scroll pill nav
```

### 2.4 About Section Pattern

레퍼런스 소개 페이지는 `ABOUT`, `VISION`, `ACTIVITY`, `ORGANIZATION`, `ALUMNI` 섹션을 image + text, white/gray alternating section으로 구성한다.

우리 사이트 적용:

```txt
/about:
- ABOUT
- VISION
- ACTIVITY
- ORGANIZATION
- ALUMNI NETWORK
```

### 2.5 Curriculum Step Pattern

레퍼런스 Curriculum은 `CURRICULUM`, `JUNIOR`, `ACTING`, `ALUMNI` 섹션과 주차별 step box, 참고사항 박스를 사용한다.

우리 사이트 적용:

```txt
/curriculum:
- 팀별 tab: 전체 / IB / 리서치 / 파생상품 / 퀀트
- Module card 또는 Week stepper
- 참고사항 callout
```

### 2.6 History Timeline Pattern

레퍼런스 연혁은 기수 범위별 tab과 연도/기수/월별 timeline list를 사용한다.

우리 사이트 적용:

```txt
/history:
- 연도 또는 기수 범위 tab
- 연도/학기 heading
- 월별 이벤트 리스트
- 주요 성과 highlight badge
- alternating gray background
```

### 2.7 Board Pattern

레퍼런스 공개 레포트와 학회 안내자료는 `nboard-list` 구조를 사용한다.

기본 row 구성:

```txt
번호
제목
작성자
날짜
조회수
다운로드 아이콘
검색 영역
페이지네이션
```

우리 사이트 적용:

```txt
공통 BoardList:
- 공개 리포트
- 팀별 자료
- 면접 후기
- 홍보자료
```

단, 수정 요구사항에 따라 댓글 수, 카테고리, 태그, visibility 표시를 제거한다.

### 2.8 Recruitment Card Pattern

레퍼런스 인재상 페이지는 `Reason`, `Insight`, `Spirit`, `Knowledge` 네 개의 icon card를 사용한다.

우리 사이트 적용:

```txt
/recruiting:
- Reason
- Insight
- Spirit
- Knowledge
- 지원 자격
- 모집 일정
- 지원서 다운로드
- 홍보자료 board
```

---

## 3. Product Definition

### 3.1 제품 한 줄 정의

한양대 금융학회 홈페이지는 학회의 정체성, 커리큘럼, 연혁, 리크루팅, 공개 리포트를 외부에 공개하고, 승인 회원에게는 팀별 자료실과 면접 후기 아카이브를 제공하는 권한 기반 CMS다.

### 3.2 제품 범위

```txt
Public:
- Home
- 학회 소개
- 팀별 커리큘럼
- 학회 연혁
- 공개 리포트
- Alumni
- 리크루팅
- 회원가입
- 로그인

Member:
- IB 팀 자료
- 리서치 팀 자료
- 파생상품 팀 자료
- 퀀트 팀 자료

Restricted Member:
- 면접 후기

Admin:
- 회원 승인
- role 변경
- 게시글 관리
- 배너 관리
- 지원서 파일 관리
- 홍보자료 관리
- audit log
```

### 3.3 핵심 비즈니스 규칙

```txt
1. 회원가입 직후 사용자는 PENDING_USER다.
2. ADMIN 승인 후 MEMBER가 된다.
3. 팀 정보는 회원가입과 DB에 저장하지 않는다.
4. 모든 MEMBER 이상은 모든 팀 자료실을 열람/작성할 수 있다.
5. 면접 후기는 INTERVIEW_REVIEWER와 ADMIN만 열람/작성 가능하다.
6. ADMIN은 회장 1명만 사용한다.
7. 글 수정/삭제는 작성자 또는 ADMIN만 가능하다.
8. board_type은 route에서 서버가 자동 결정한다.
9. category/tag/visibility는 게시글 모델과 UI에서 제거한다.
10. visibility는 board_type policy로부터 계산한다.
11. 공개 리포트와 리크루팅 자료는 전체 공개 다운로드 가능하다.
12. 팀 자료 파일은 MEMBER 이상만 다운로드 가능하다.
13. 면접 후기는 첨부파일을 허용하지 않는다.
14. 면접 후기 읽기 화면에는 복사 억제 UX를 적용한다.
```

---

## 4. Goals / Non-goals

### 4.1 Goals

```txt
G1. 학회 브랜드를 전문적이고 신뢰감 있는 금융/리서치 조직처럼 표현한다.
G2. 한양대 블루 중심의 고급스럽고 정제된 디자인 시스템을 만든다.
G3. 공개 정보와 회원 전용 정보를 명확히 분리한다.
G4. 관리자 1명이 회원 승인, 게시글 관리, 배너 관리, 지원서 파일 교체를 직접 처리할 수 있게 한다.
G5. 게시판 엔진은 공통화하고, board_type으로 정책을 자동 결정한다.
G6. 회원 전용 페이지가 검색엔진, sitemap, 캐시, 직접 URL 접근으로 노출되지 않도록 한다.
G7. 면접 후기는 제한 권한과 복사 억제 UX를 적용한다.
G8. 개발자가 운영 중 기능을 쉽게 확장할 수 있는 DB/API/컴포넌트 구조를 만든다.
```

### 4.2 Non-goals

```txt
N1. 팀별 회원 권한 구분은 구현하지 않는다.
N2. 회원가입에서 팀을 받지 않는다.
N3. 면접 후기에 회사/직무/전형별 구조화 필드를 만들지 않는다.
N4. 지원서 작성 웹폼을 만들지 않는다.
N5. 외부 Google Form/Typeform 링크를 지원하지 않는다.
N6. Home에 최근 공개 리포트 목록을 넣지 않는다.
N7. 사용자에게 category/tag/visibility 선택 기능을 제공하지 않는다.
N8. 댓글 기능을 만들지 않는다.
N9. 학회 내부 메신저, 알림, DM 기능을 만들지 않는다.
N10. 팀별 자료 간섭을 기술적으로 사전 차단하지 않는다. 문제 발생 시 ADMIN이 사후 처리한다.
```

---

## 5. 사용자 유형

### 5.1 Visitor

비로그인 사용자.

가능:

```txt
- 공개 페이지 열람
- 공개 리포트 열람/다운로드
- Alumni 페이지 열람
- 리크루팅 페이지 열람
- 지원서 다운로드
- 홍보자료 다운로드
- 회원가입 요청
- 로그인
```

불가:

```txt
- 글 작성
- 회원 전용 팀 자료 열람
- 팀 자료 다운로드
- 면접 후기 열람
- 관리자 페이지 접근
```

### 5.2 Pending User

회원가입 요청 후 승인 대기 상태.

가능:

```txt
- 공개 페이지 열람
- 로그인 후 승인 대기 상태 확인
```

불가:

```txt
- 회원 전용 페이지 접근
- 글 작성
- 면접 후기 접근
```

메시지:

```txt
관리자 승인 후 이용 가능합니다.
```

### 5.3 Member

승인된 일반 회원.

가능:

```txt
- 공개 리포트 작성
- 팀별 자료실 열람
- 팀별 자료실 글 작성
- 본인 글 수정/삭제
- 팀 자료 다운로드
```

불가:

```txt
- 면접 후기 열람/작성
- 타인 글 수정/삭제
- 관리자 페이지 접근
```

### 5.4 Interview Reviewer

면접 후기 권한이 있는 회원.

가능:

```txt
- MEMBER 권한 전부
- 면접 후기 열람
- 면접 후기 작성
- 본인 면접 후기 수정/삭제
```

불가:

```txt
- 타인 글 수정/삭제
- 관리자 페이지 접근
```

### 5.5 Admin

회장 1명. 앱 내 최고 권한.

가능:

```txt
- 모든 공개/회원/면접 후기 페이지 접근
- 모든 글 수정/삭제
- 회원 승인/거절
- role 변경
- 배너 관리
- 지원서 파일 교체
- 홍보자료 관리
- audit log 조회
```

---

## 6. Information Architecture

### 6.1 최상위 Navigation

```txt
HOME
ABOUT
REPORTS
RECRUITING
MEMBER
JOIN
LOGIN
```

로그인 후:

```txt
HOME
ABOUT
REPORTS
RECRUITING
MEMBER
MY
LOGOUT
```

ADMIN 로그인 후:

```txt
HOME
ABOUT
REPORTS
RECRUITING
MEMBER
ADMIN
LOGOUT
```

### 6.2 Site Tree

```txt
/
/about
/curriculum
/history
/reports
/reports/[id]
/reports/new
/reports/[id]/edit
/alumni
/recruiting
/signup
/login
/member/teams/ib
/member/teams/ib/[id]
/member/teams/ib/new
/member/teams/ib/[id]/edit
/member/teams/research
/member/teams/research/[id]
/member/teams/research/new
/member/teams/research/[id]/edit
/member/teams/derivatives
/member/teams/derivatives/[id]
/member/teams/derivatives/new
/member/teams/derivatives/[id]/edit
/member/teams/quant
/member/teams/quant/[id]
/member/teams/quant/new
/member/teams/quant/[id]/edit
/member/interviews
/member/interviews/[id]
/member/interviews/new
/member/interviews/[id]/edit
/admin
/admin/users
/admin/posts
/admin/banners
/admin/recruiting
/admin/audit-logs
```

### 6.3 Route Access Table

| Route | Access | Notes |
|---|---|---|
| `/` | VISITOR | Home. 최근 공개 리포트 없음. |
| `/about` | VISITOR | 학회 소개. |
| `/curriculum` | VISITOR | 공개 팀별 커리큘럼. |
| `/history` | VISITOR | 연혁. |
| `/reports` | VISITOR | 공개 리포트 목록. |
| `/reports/[id]` | VISITOR | 공개 리포트 상세. |
| `/reports/new` | MEMBER | board_type = PUBLIC_REPORT. |
| `/reports/[id]/edit` | AUTHOR_OR_ADMIN | 작성자 또는 ADMIN. |
| `/alumni` | VISITOR | 공개 가능한 alumni만. |
| `/recruiting` | VISITOR | 지원서 파일 다운로드. |
| `/signup` | VISITOR | 이름/ID/비밀번호만. |
| `/login` | VISITOR | 로그인. |
| `/member/teams/*` | MEMBER | 모든 MEMBER 이상 접근 가능. |
| `/member/interviews` | INTERVIEW_REVIEWER | MEMBER는 접근 불가. |
| `/member/interviews/[id]` | INTERVIEW_REVIEWER | 복사 억제 적용. |
| `/admin/*` | ADMIN | 회장 단일 관리자. |

---

## 7. Role / Authorization Model

### 7.1 Role Hierarchy

```ts
export const ROLE_LEVEL = {
  VISITOR: 0,
  PENDING_USER: 1,
  MEMBER: 2,
  INTERVIEW_REVIEWER: 3,
  ADMIN: 4,
} as const;

export type Role = keyof typeof ROLE_LEVEL;

export function hasRoleAtLeast(userRole: Role, requiredRole: Role): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole];
}
```

### 7.2 DB 저장 Role

`VISITOR`는 DB에 저장하지 않는다. 비로그인 상태를 의미한다.

```sql
CREATE TYPE user_role AS ENUM (
  'PENDING_USER',
  'MEMBER',
  'INTERVIEW_REVIEWER',
  'ADMIN'
);
```

### 7.3 권한 매트릭스

| 기능 | Visitor | Pending User | Member | Interview Reviewer | Admin |
|---|---:|---:|---:|---:|---:|
| 공개 페이지 열람 | O | O | O | O | O |
| 공개 리포트 열람 | O | O | O | O | O |
| 공개 리포트 다운로드 | O | O | O | O | O |
| 공개 리포트 작성 | X | X | O | O | O |
| 본인 공개 리포트 수정 | X | X | O | O | O |
| 타인 공개 리포트 수정 | X | X | X | X | O |
| 팀 자료 열람 | X | X | O | O | O |
| 팀 자료 다운로드 | X | X | O | O | O |
| 팀 자료 작성 | X | X | O | O | O |
| 본인 팀 자료 수정 | X | X | O | O | O |
| 타인 팀 자료 수정 | X | X | X | X | O |
| 면접 후기 열람 | X | X | X | O | O |
| 면접 후기 작성 | X | X | X | O | O |
| 본인 면접 후기 수정 | X | X | X | O | O |
| 타인 면접 후기 수정 | X | X | X | X | O |
| 회원 승인 | X | X | X | X | O |
| role 변경 | X | X | X | X | O |
| 배너 관리 | X | X | X | X | O |
| 지원서 관리 | X | X | X | X | O |

### 7.4 Author or Admin Guard

```ts
export function canEditPost(params: {
  userId: string;
  userRole: Role;
  postAuthorId: string;
}): boolean {
  return params.userRole === "ADMIN" || params.userId === params.postAuthorId;
}
```

### 7.5 단일 Admin 정책

운영 정책상 ADMIN은 회장 1명이다.

DB에서 강제하려면 partial unique index를 둔다.

```sql
CREATE UNIQUE INDEX users_single_admin_idx
ON users ((role))
WHERE role = 'ADMIN' AND deleted_at IS NULL;
```

주의: 회장 이양 시 transaction 안에서 기존 ADMIN을 MEMBER 또는 INTERVIEW_REVIEWER로 내리고 새 ADMIN을 지정해야 한다.

---

## 8. Board Type Policy

### 8.1 Board Type

```ts
export type BoardType =
  | "PUBLIC_REPORT"
  | "TEAM_IB_OUTPUT"
  | "TEAM_RESEARCH_OUTPUT"
  | "TEAM_DERIVATIVES_OUTPUT"
  | "TEAM_QUANT_OUTPUT"
  | "INTERVIEW_REVIEW"
  | "RECRUIT_MATERIAL";
```

### 8.2 Board Type은 사용자 입력이 아니다

`board_type`은 form input, hidden input, select로 보내지 않는다. 서버 route가 결정한다.

```txt
POST /api/reports
→ board_type = PUBLIC_REPORT

POST /api/member/teams/ib/posts
→ board_type = TEAM_IB_OUTPUT

POST /api/member/interviews
→ board_type = INTERVIEW_REVIEW
```

클라이언트가 임의로 board_type을 payload에 넣어도 서버는 무시한다.

### 8.3 Board Policy Table

| board_type | Page | Read | Create | Update/Delete | Attachments | Storage | SEO |
|---|---|---|---|---|---:|---|---|
| `PUBLIC_REPORT` | `/reports` | VISITOR | MEMBER | AUTHOR_OR_ADMIN | O | public | index |
| `TEAM_IB_OUTPUT` | `/member/teams/ib` | MEMBER | MEMBER | AUTHOR_OR_ADMIN | O | private | noindex |
| `TEAM_RESEARCH_OUTPUT` | `/member/teams/research` | MEMBER | MEMBER | AUTHOR_OR_ADMIN | O | private | noindex |
| `TEAM_DERIVATIVES_OUTPUT` | `/member/teams/derivatives` | MEMBER | MEMBER | AUTHOR_OR_ADMIN | O | private | noindex |
| `TEAM_QUANT_OUTPUT` | `/member/teams/quant` | MEMBER | MEMBER | AUTHOR_OR_ADMIN | O | private | noindex |
| `INTERVIEW_REVIEW` | `/member/interviews` | INTERVIEW_REVIEWER | INTERVIEW_REVIEWER | AUTHOR_OR_ADMIN | X | none | noindex |
| `RECRUIT_MATERIAL` | `/recruiting` | VISITOR | ADMIN | ADMIN | O | public | index |

### 8.4 Board Policy Object

```ts
export const BOARD_POLICY = {
  PUBLIC_REPORT: {
    readRole: "VISITOR",
    createRole: "MEMBER",
    allowAttachments: true,
    storage: "public",
    indexable: true,
    copyProtection: false,
  },
  TEAM_IB_OUTPUT: {
    readRole: "MEMBER",
    createRole: "MEMBER",
    allowAttachments: true,
    storage: "private",
    indexable: false,
    copyProtection: false,
  },
  TEAM_RESEARCH_OUTPUT: {
    readRole: "MEMBER",
    createRole: "MEMBER",
    allowAttachments: true,
    storage: "private",
    indexable: false,
    copyProtection: false,
  },
  TEAM_DERIVATIVES_OUTPUT: {
    readRole: "MEMBER",
    createRole: "MEMBER",
    allowAttachments: true,
    storage: "private",
    indexable: false,
    copyProtection: false,
  },
  TEAM_QUANT_OUTPUT: {
    readRole: "MEMBER",
    createRole: "MEMBER",
    allowAttachments: true,
    storage: "private",
    indexable: false,
    copyProtection: false,
  },
  INTERVIEW_REVIEW: {
    readRole: "INTERVIEW_REVIEWER",
    createRole: "INTERVIEW_REVIEWER",
    allowAttachments: false,
    storage: "none",
    indexable: false,
    copyProtection: true,
  },
  RECRUIT_MATERIAL: {
    readRole: "VISITOR",
    createRole: "ADMIN",
    allowAttachments: true,
    storage: "public",
    indexable: true,
    copyProtection: false,
  },
} as const;
```

---

## 9. Design System

### 9.1 디자인 방향

```txt
Tone:
- Institutional
- Finance
- Academic
- Premium
- Clean
- Trustworthy

Avoid:
- 과도한 동아리 감성
- 과한 red accent
- 카드뉴스식 산만한 UI
- 과도한 animation
- public/member/admin 간 디자인 불일치
```

### 9.2 Color Tokens

```css
:root {
  --hy-blue: #1D2475;
  --hy-blue-dark: #111853;
  --hy-blue-deep: #080D2B;
  --hy-blue-soft: #E9ECFF;
  --hy-gray: #3F3D42;
  --hy-silver: #939396;
  --hy-gold: #AB863F;
  --paper: #FFFFFF;
  --muted: #F5F7FB;
  --line: #E5E8F0;
  --text: #111827;
  --text-muted: #6B7280;
  --danger: #B42318;
  --success: #027A48;
  --warning: #B54708;
}
```

### 9.3 Color Usage

| Area | Token | Rule |
|---|---|---|
| Header initial | transparent | Hero 위에서는 white text |
| Header scrolled | `--hy-blue-deep` | fixed dark navy |
| Primary CTA | `--hy-blue` | hover `--hy-blue-dark` |
| Secondary CTA | white/transparent | border 기반 |
| Section title accent | `--hy-blue` | underline 또는 span accent |
| Premium accent | `--hy-gold` | 매우 제한적으로만 사용 |
| Footer | `--hy-blue-deep` | white/gray text |
| Board hover | `--hy-blue` | title/download icon hover |
| Member-only | `--hy-blue-deep` | secure/internal tone |

### 9.4 Typography

권장 기본 폰트:

```css
font-family: Pretendard, "Noto Sans KR", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

영문 보조:

```css
font-family: Inter, Pretendard, system-ui, sans-serif;
```

| Element | Desktop | Mobile | Weight |
|---|---:|---:|---:|
| Hero EN title | 64-76px | 38-44px | 700 |
| Hero KR subtitle | 22-28px | 17-20px | 500 |
| Section label | 13px, letter-spacing 0.16em | 12px | 700 |
| Section title | 40-48px | 28-34px | 700 |
| Body | 16-18px, line-height 1.8 | 15-16px | 400 |
| Board title | 18-20px | 16px | 600 |
| Metadata | 13-14px | 12px | 400 |

### 9.5 Layout Widths

```css
--container-xl: 1200px;
--container-lg: 1080px;
--container-md: 960px;
--section-y-desktop: 112px;
--section-y-tablet: 80px;
--section-y-mobile: 56px;
```

### 9.6 Breakpoints

```ts
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};
```

### 9.7 Animation

레퍼런스는 `to-animate`, `fadeInUp` 계열 animation을 사용한다. 새 사이트는 과도한 jQuery animation 대신 CSS/Framer Motion 또는 단순 Intersection Observer 기반 reveal을 사용한다.

원칙:

```txt
- content reveal은 opacity + translateY 16px 이하
- duration 350-500ms
- delay는 120ms 이하
- prefers-reduced-motion: reduce 존중
- 게시판 행에는 과도한 animation 금지
```

### 9.8 Iconography

```txt
- 금융/리서치 톤에 맞는 line icon 사용
- 다운로드, 검색, 사용자, lock, calendar, file, chart icon 일관화
- 아이콘 stroke width 1.5-2px
- primary icon color = --hy-blue
```

---

## 10. Common Components

### 10.1 Header

Props:

```ts
type HeaderProps = {
  session: Session | null;
  activeTopNav: "HOME" | "ABOUT" | "REPORTS" | "RECRUITING" | "MEMBER" | "ADMIN";
};
```

Requirements:

```txt
- desktop height: 76px
- mobile height: 64px
- transparent over hero
- scrolled state: --hy-blue-deep background
- logo white variant on transparent/dark
- logo blue/dark variant on white, if needed
- active nav underline
- MEMBER nav click when unauthenticated: show exact modal text
- ADMIN nav hidden unless ADMIN
```

Member-only modal text:

```txt
회원 전용 페이지입니다. 로그인 후 이용해주세요
```

### 10.2 Mobile Drawer

```txt
- full-screen 또는 right-side overlay
- dark navy background
- scroll lock body
- close on ESC
- close on route change
- includes JOIN/LOGIN or LOGOUT
- member-only menu click applies same guard modal
```

### 10.3 SubHero

Props:

```ts
type SubHeroProps = {
  pageKey: BannerPageKey;
  titleEn: string;
  titleKo?: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
};
```

Requirements:

```txt
- desktop height: 380-420px
- mobile height: 240-280px
- background image from banners table
- overlay: rgba(8, 13, 43, 0.58)
- title centered
- breadcrumb below title
- alt text stored in banner data
```

### 10.4 SubNavigation

Props:

```ts
type SubNavigationProps = {
  topGroup: "ABOUT" | "REPORTS" | "RECRUITING" | "MEMBER" | "ADMIN";
  currentPath: string;
};
```

Desktop:

```txt
- home icon cell
- first dropdown: top groups
- second dropdown: current group children
```

Mobile:

```txt
- horizontal scroll pills
- active pill = --hy-blue background or underline
```

### 10.5 BoardList

Props:

```ts
type BoardListProps = {
  boardType: BoardType;
  posts: BoardPostListItem[];
  session: Session | null;
  canWrite: boolean;
  basePath: string;
  showDownload: boolean;
  showCopyProtection?: boolean;
};
```

Columns:

```txt
- 번호
- 제목
- 작성자
- 작성일
- 조회수
- 다운로드 아이콘, only when board policy allows attachments/download
```

Removed columns:

```txt
- 댓글 수
- 카테고리
- 태그
- visibility
```

### 10.6 BoardWriteButton

```txt
- 목록 하단 우측에 배치
- 권한 있는 사용자에게만 노출
- Visitor/Pending는 숨김
- 클릭 시 route별 /new로 이동
```

### 10.7 PostEditor

Props:

```ts
type PostEditorProps = {
  mode: "create" | "edit";
  boardType: BoardType;
  initialData?: {
    title: string;
    content: string;
    attachments?: Attachment[];
  };
};
```

Fields:

```txt
- title
- content
- attachments only if BOARD_POLICY[boardType].allowAttachments === true
```

Excluded fields:

```txt
- board_type select
- category
- tag
- visibility
```

### 10.8 AttachmentUploader

```txt
- multiple file support
- drag/drop support
- allowed extensions display
- upload progress
- validation before upload
- server-side re-validation required
```

### 10.9 DownloadButton

```txt
- public files: direct download endpoint
- private files: authenticated signed URL endpoint
- increments download count
- writes audit log for private downloads
```

### 10.10 InterviewProtectedLayout

Applies only to:

```txt
/member/interviews
/member/interviews/[id]
```

Does not apply to:

```txt
/member/interviews/new
/member/interviews/[id]/edit
```

---

## 11. Page Specifications

## 11.1 Home `/`

### Objective

첫 화면에서 학회 정체성, 활동 영역, 리크루팅 CTA, 네트워크를 표현한다. 최근 공개 리포트는 보여주지 않는다.

### Sections

```txt
1. HomeHero
2. KeyMetrics
3. AboutPreview
4. TeamOverviewCards
5. RecruitingCTA
6. AlumniNetworkPreview
```

### HomeHero

Content example:

```txt
Hanyang Investment Society
시장을 읽고, 거래를 구조화하고, 리스크를 검증하는 학회
```

CTA:

```txt
- 학회 소개
- 리크루팅 바로가기
```

### KeyMetrics

Fields:

```txt
- 설립연도
- 누적 기수
- 활동 회원 수
- Alumni 수
- 누적 리포트 수
- 주요 성과 수
```

관리자 수정 가능 여부:

```txt
v1: seed/static config
v2: admin CMS editable
```

### TeamOverviewCards

Public card only. 링크를 MEMBER 팀 자료 페이지로 연결할 경우 비로그인 사용자 클릭 시 modal 표시.

Teams:

```txt
- IB
- 리서치
- 파생상품
- 퀀트
```

### Explicit Exclusion

```txt
Home에 최근 공개 리포트 목록을 넣지 않는다.
```

---

## 11.2 About `/about`

### Objective

학회의 정체성, 비전, 활동 체계, 조직 구조, Alumni network를 공개한다.

### Layout

```txt
SubHero
SubNavigation
Section ABOUT
Section VISION
Section ACTIVITY
Section ORGANIZATION
Section ALUMNI NETWORK
```

### ABOUT

Fields:

```txt
- section_label = ABOUT
- headline
- body paragraphs
- optional image/logo
```

### VISION

Card list:

```txt
- Market Insight
- Corporate Analysis
- Deal Structuring
- Risk Discipline
- Research Communication
```

### ACTIVITY

Activities:

```txt
- 정규 세션
- 팀별 프로젝트
- 리포트 작성
- 내부 발표
- 외부 대회/연합 세션
- Alumni seminar
```

### ORGANIZATION

```txt
- 회장단
- 운영진
- IB
- 리서치
- 파생상품
- 퀀트
```

### ALUMNI NETWORK

```txt
- 업권 분포
- 공개 가능한 네트워크 요약
- 개인정보 최소화
```

---

## 11.3 Curriculum `/curriculum`

### Objective

외부 지원자와 방문자에게 학회의 교육 체계를 공개한다. 회원 전용 팀 자료 페이지와 다르다.

### Sections

```txt
SubHero
SubNavigation
Intro
Team Tabs
Curriculum Modules
Reference Callout
```

### Team Tabs

```txt
- 전체
- IB
- 리서치
- 파생상품
- 퀀트
```

### Module Data Model

```ts
type CurriculumModule = {
  id: string;
  team: "IB" | "RESEARCH" | "DERIVATIVES" | "QUANT";
  order: number;
  title: string;
  objective: string;
  description: string;
  assignment?: string;
  output?: string;
};
```

### IB Modules

```txt
Module 1. Accounting & Financial Statements
Module 2. Corporate Finance Fundamentals
Module 3. Valuation: DCF
Module 4. Comparable Companies
Module 5. Precedent Transactions
Module 6. M&A / IPO Pitchbook
```

### Research Modules

```txt
Module 1. 산업 분석
Module 2. 기업 분석
Module 3. 재무 모델링
Module 4. Investment Thesis
Module 5. Catalyst & Risk
Module 6. 목표주가 산정 및 리포트 작성
```

### Derivatives Modules

```txt
Module 1. 선물·옵션 기초
Module 2. Payoff Structure
Module 3. Greeks
Module 4. Volatility
Module 5. Hedging
Module 6. Structured Products
```

### Quant Modules

```txt
Module 1. Python Research Environment
Module 2. Statistics & Time Series
Module 3. Factor Research
Module 4. Backtesting
Module 5. Portfolio Construction
Module 6. Risk Metrics & Reporting
```

### UI Requirements

```txt
- step-area/card grid
- module order visible
- current selected tab state
- reference callout box
- mobile: one-column cards
```

---

## 11.4 History `/history`

### Objective

학회의 연혁, 주요 활동, 수상내역을 연도/기수/월별 timeline으로 공개한다.

### Structure

```txt
SubHero
SubNavigation
HISTORY title
Filter tabs
Timeline list
```

### Filter Tabs

Initial recommended tabs:

```txt
- 전체
- 최근 5년
- 2020s
- 2010s
- 2000s
- 수상내역
```

If the 학회 uses 기수 more strongly, use:

```txt
- 최신 기수
- 중간 기수
- 초기 기수
```

### Data Model

```ts
type HistoryEvent = {
  id: string;
  year: number;
  termLabel?: string;
  month?: number;
  content: string;
  isHighlight: boolean;
  sortOrder: number;
};
```

### UI Requirements

```txt
- year displayed large on left
- term label below year
- month list on right
- major awards with --hy-gold badge
- alternating muted section background
- mobile: card timeline
```

---

## 11.5 Reports `/reports`

### Objective

전체 공개 리포트 아카이브. 시황, IB M&A/IPO 장표, 리서치 리포트 등 학회원이 업로드하는 공개 자료를 제공한다.

### Access

```txt
Read: VISITOR
Download: VISITOR
Create: MEMBER+
Update/Delete: AUTHOR_OR_ADMIN
```

### Board Type

```txt
PUBLIC_REPORT
```

### Fields

```txt
- title
- content
- attachments
```

### Removed Fields

```txt
- category
- tags
- visibility
```

### List Columns

```txt
- 번호
- 제목
- 작성자
- 작성일
- 조회수
- 다운로드 아이콘
```

### Search

Search targets:

```txt
- title
- content
- author.name
```

Search filters:

```txt
- 전체
- 제목
- 내용
- 작성자
```

### Write Button

```txt
- 위치: 목록 하단 우측
- Visitor: 숨김
- Pending User: 숨김
- Member+: 노출
```

### Detail Page

```txt
- title
- author
- created_at
- view_count
- content
- attachment list
- download buttons
- edit/delete buttons only for author/admin
- public disclaimer
```

Disclaimer:

```txt
본 자료는 학술 및 교육 목적으로 작성되었으며, 특정 금융상품에 대한 투자 권유가 아닙니다.
```

---

## 11.6 Alumni `/alumni`

### Objective

공개 가능한 alumni network를 보여준다. 개인정보는 최소화한다.

### Public Field Policy

| Field | Default | Notes |
|---|---|---|
| cohort | public | 기수 또는 학번 범위 |
| industry | public | 증권, 운용, IB, PE/VC 등 |
| name | private | 동의한 경우만 공개 |
| company | private | 동의한 경우만 공개 |
| role_title | private | 동의한 경우만 공개 |
| email | never public | 공개 금지 |
| phone | never public | 공개 금지 |

### UI

```txt
- Industry distribution
- Alumni cards
- 기수 filter
- 직무군 filter
```

---

## 11.7 Recruiting `/recruiting`

### Objective

지원자에게 인재상, 지원 자격, 모집 일정, 지원서 다운로드, 홍보자료를 제공한다.

### Sections

```txt
SubHero
SubNavigation
RecruitingStatus
TalentCards
Eligibility
Schedule
ApplicationDownload
RecruitMaterialsBoard
```

### Talent Cards

```txt
- Reason
- Insight
- Spirit
- Knowledge
```

Copy examples:

```txt
Reason: 논리와 근거에 기반해 판단하는 사람
Insight: 기업, 산업, 시장을 입체적으로 읽는 사람
Spirit: 금융과 투자에 대한 지속적인 열정을 가진 사람
Knowledge: 다양한 분야의 지식을 연결해 사고하는 사람
```

### Application Download

```txt
- active 지원서 파일 1개
- 전체 공개 다운로드
- 관리자만 교체 가능
- 외부 지원 링크 없음
```

### Recruiting Materials

Board Type:

```txt
RECRUIT_MATERIAL
```

Access:

```txt
Read: VISITOR
Download: VISITOR
Create/Update/Delete: ADMIN
```

---

## 11.8 Signup `/signup`

### Objective

회원가입 요청을 생성한다. 즉시 MEMBER가 되지 않는다.

### Fields

| Field | Required | Validation |
|---|---:|---|
| name | O | 2-20자 |
| login_id | O | 영문/숫자/underscore, 4-32자, unique |
| password | O | 8자 이상 |
| password_confirm | O | password와 일치 |

### Explicitly Removed

```txt
- 팀 선택
- 희망 팀
- 현재 팀
- 학번
- 학과
- 이메일, v1에서는 선택하지 않음 unless later required
```

### Flow

```txt
Submit signup
→ users.role = PENDING_USER
→ success page: 가입 요청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.
→ Admin approval
→ role = MEMBER
```

---

## 11.9 Login `/login`

### Fields

```txt
- ID
- password
```

### Outcomes

| Case | Response |
|---|---|
| invalid ID/password | 아이디 또는 비밀번호가 올바르지 않습니다. |
| PENDING_USER | 로그인 허용 후 승인 대기 화면 또는 로그인 차단. 권장: 로그인 허용. |
| MEMBER+ | intended destination으로 redirect |

### Member-only Redirect

Direct access example:

```txt
GET /member/teams/quant
→ no session
→ redirect /login?next=/member/teams/quant&reason=member-only
→ login page message: 회원 전용 페이지입니다. 로그인 후 이용해주세요
```

---

## 11.10 Member Team Pages

### Common Layout

```txt
SubHero title: MEMBER
Breadcrumb: Home > Member > [Team] 팀 자료
SubNavigation: IB / 리서치 / 파생상품 / 퀀트 / 면접 후기
Board title
BoardList
Search
Pagination
Write button
```

### Removed Content

```txt
- 팀 소개
- 팀 커리큘럼 요약
- 팀 멤버 소개
- 팀별 권한 안내
```

### Routes and Board Types

| Page | Board Type |
|---|---|
| `/member/teams/ib` | `TEAM_IB_OUTPUT` |
| `/member/teams/research` | `TEAM_RESEARCH_OUTPUT` |
| `/member/teams/derivatives` | `TEAM_DERIVATIVES_OUTPUT` |
| `/member/teams/quant` | `TEAM_QUANT_OUTPUT` |

### Access

```txt
Read: MEMBER+
Download: MEMBER+
Create: MEMBER+
Update/Delete: AUTHOR_OR_ADMIN
```

### Write Flow

```txt
/member/teams/ib
→ 하단 [글쓰기]
→ /member/teams/ib/new
→ server board_type = TEAM_IB_OUTPUT
→ title/content/attachments 입력
→ 저장
```

---

## 11.11 Interview Reviews `/member/interviews`

### Objective

관리자가 허가한 회원만 볼 수 있는 면접 후기 아카이브.

### Access

```txt
Read: INTERVIEW_REVIEWER+
Create: INTERVIEW_REVIEWER+
Update/Delete: AUTHOR_OR_ADMIN
```

### Fields

```txt
- title
- content
```

### Attachments

```txt
면접 후기는 첨부파일 없음.
```

### List Columns

```txt
- 번호
- 제목
- 작성자
- 작성일
- 조회수
```

No download column.

### Copy Protection

Applies to:

```txt
- /member/interviews
- /member/interviews/[id]
```

Does not apply to:

```txt
- /member/interviews/new
- /member/interviews/[id]/edit
```

### Unauthorized Messages

Visitor:

```txt
회원 전용 페이지입니다. 로그인 후 이용해주세요
```

Member without interview permission:

```txt
접근 권한이 없습니다.
```

Pending User:

```txt
관리자 승인 후 이용 가능합니다.
```

---

## 11.12 Admin

### Admin Dashboard `/admin`

Widgets:

```txt
- 승인 대기 회원 수
- 최근 공개 리포트
- 최근 팀 자료
- 최근 면접 후기
- 최근 private 다운로드 로그
- 현재 지원서 파일
- 배너 관리 바로가기
```

### Users `/admin/users`

Columns:

```txt
- 이름
- ID
- role
- 가입일
- 승인일
- 최근 로그인
- 상태
```

Actions:

```txt
- 승인: PENDING_USER → MEMBER
- 거절
- MEMBER → INTERVIEW_REVIEWER
- INTERVIEW_REVIEWER → MEMBER
- ADMIN 지정, 운영상 회장 이양 시에만
- 계정 잠금/해제
- soft delete
```

### Posts `/admin/posts`

Filters:

```txt
- board_type
- author
- keyword
- created date
```

Actions:

```txt
- view
- edit
- delete
- restore, optional
- attachment remove
```

No category/tag/visibility edit.

### Banners `/admin/banners`

Page keys:

```ts
export type BannerPageKey =
  | "home"
  | "about"
  | "curriculum"
  | "history"
  | "reports"
  | "alumni"
  | "recruiting"
  | "member"
  | "interviews"
  | "admin";
```

Fields:

```txt
- desktop image
- mobile image optional
- alt text
- overlay opacity
- object position
```

### Recruiting `/admin/recruiting`

```txt
- active 지원서 파일 업로드/교체
- 지원서 다운로드 수 확인
- 홍보자료 작성/수정/삭제
```

### Audit Logs `/admin/audit-logs`

Events:

```txt
- USER_APPROVED
- USER_REJECTED
- ROLE_CHANGED
- POST_CREATED
- POST_UPDATED
- POST_DELETED
- ATTACHMENT_DOWNLOADED
- INTERVIEW_VIEWED
- BANNER_UPDATED
- APPLICATION_FORM_UPDATED
```

---

## 12. Data Model

### 12.1 PostgreSQL Extensions

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### 12.2 users

```sql
CREATE TYPE user_role AS ENUM (
  'PENDING_USER',
  'MEMBER',
  'INTERVIEW_REVIEWER',
  'ADMIN'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  login_id VARCHAR(32) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(20) NOT NULL,
  role user_role NOT NULL DEFAULT 'PENDING_USER',

  approved_at TIMESTAMPTZ NULL,
  approved_by UUID NULL REFERENCES users(id),

  rejected_at TIMESTAMPTZ NULL,
  rejected_by UUID NULL REFERENCES users(id),
  rejection_reason TEXT NULL,

  last_login_at TIMESTAMPTZ NULL,
  failed_login_count INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL
);

CREATE UNIQUE INDEX users_single_admin_idx
ON users ((role))
WHERE role = 'ADMIN' AND deleted_at IS NULL;

CREATE INDEX users_role_idx ON users(role);
CREATE INDEX users_created_at_idx ON users(created_at DESC);
```

No team column.

### 12.3 posts

```sql
CREATE TYPE board_type AS ENUM (
  'PUBLIC_REPORT',
  'TEAM_IB_OUTPUT',
  'TEAM_RESEARCH_OUTPUT',
  'TEAM_DERIVATIVES_OUTPUT',
  'TEAM_QUANT_OUTPUT',
  'INTERVIEW_REVIEW',
  'RECRUIT_MATERIAL'
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_type board_type NOT NULL,

  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,

  author_id UUID NOT NULL REFERENCES users(id),

  view_count INT NOT NULL DEFAULT 0,
  download_count INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX posts_board_created_idx ON posts(board_type, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX posts_author_idx ON posts(author_id);
CREATE INDEX posts_title_search_idx ON posts USING gin(to_tsvector('simple', title));
CREATE INDEX posts_content_search_idx ON posts USING gin(to_tsvector('simple', content));
```

No category/tags/visibility/team.

### 12.4 attachments

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id),

  storage_key TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  checksum TEXT NULL,

  uploaded_by UUID NOT NULL REFERENCES users(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX attachments_post_idx ON attachments(post_id) WHERE deleted_at IS NULL;
CREATE INDEX attachments_storage_key_idx ON attachments(storage_key);
```

For `INTERVIEW_REVIEW`, application service must reject attachments.

### 12.5 banners

```sql
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  page_key VARCHAR(80) UNIQUE NOT NULL,
  desktop_image_key TEXT NOT NULL,
  mobile_image_key TEXT NULL,

  alt_text VARCHAR(200) NOT NULL,
  overlay_opacity NUMERIC(3,2) NOT NULL DEFAULT 0.58,
  object_position VARCHAR(40) NOT NULL DEFAULT 'center center',

  updated_by UUID NOT NULL REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 12.6 recruitment_assets

```sql
CREATE TYPE recruitment_asset_type AS ENUM (
  'APPLICATION_FORM'
);

CREATE TABLE recruitment_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type recruitment_asset_type NOT NULL,

  storage_key TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,

  download_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX recruitment_assets_single_active_application_idx
ON recruitment_assets (asset_type)
WHERE asset_type = 'APPLICATION_FORM' AND is_active = true;
```

### 12.7 history_events

```sql
CREATE TABLE history_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  year INT NOT NULL,
  term_label VARCHAR(80) NULL,
  month INT NULL,
  content TEXT NOT NULL,

  is_highlight BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX history_events_sort_idx ON history_events(year DESC, month DESC, sort_order ASC);
```

### 12.8 alumni_profiles

```sql
CREATE TABLE alumni_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(50) NULL,
  cohort VARCHAR(30) NULL,
  industry VARCHAR(80) NOT NULL,
  company VARCHAR(100) NULL,
  role_title VARCHAR(100) NULL,
  profile_text TEXT NULL,

  show_name BOOLEAN NOT NULL DEFAULT false,
  show_company BOOLEAN NOT NULL DEFAULT false,
  show_role_title BOOLEAN NOT NULL DEFAULT false,

  consent_at TIMESTAMPTZ NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL
);
```

### 12.9 audit_logs

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  actor_id UUID NULL REFERENCES users(id),
  action VARCHAR(80) NOT NULL,

  resource_type VARCHAR(80) NOT NULL,
  resource_id UUID NULL,

  ip_address INET NULL,
  user_agent TEXT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_created_idx ON audit_logs(created_at DESC);
CREATE INDEX audit_logs_actor_idx ON audit_logs(actor_id, created_at DESC);
CREATE INDEX audit_logs_action_idx ON audit_logs(action, created_at DESC);
```

---

## 13. API Specification

## 13.1 Auth API

### POST `/api/auth/signup`

Request:

```json
{
  "name": "홍길동",
  "loginId": "hong123",
  "password": "password",
  "passwordConfirm": "password"
}
```

Validation:

```txt
- name 2-20 chars
- loginId /^[a-zA-Z0-9_]{4,32}$/
- loginId unique
- password min 8 chars
- passwordConfirm matches
```

Response:

```json
{
  "ok": true,
  "message": "가입 요청이 완료되었습니다. 관리자 승인 후 이용 가능합니다."
}
```

### POST `/api/auth/login`

Request:

```json
{
  "loginId": "hong123",
  "password": "password"
}
```

Response:

```json
{
  "ok": true,
  "user": {
    "id": "uuid",
    "loginId": "hong123",
    "name": "홍길동",
    "role": "MEMBER"
  }
}
```

### POST `/api/auth/logout`

Clears session cookie.

### GET `/api/auth/me`

Returns current user or null.

---

## 13.2 Public Reports API

### GET `/api/reports`

Query:

```txt
?page=1&pageSize=10&searchKey=title|content|author|all&keyword=...
```

Server:

```txt
board_type = PUBLIC_REPORT
readRole = VISITOR
```

### POST `/api/reports`

Access:

```txt
MEMBER+
```

Server:

```txt
board_type = PUBLIC_REPORT, regardless of payload
```

Request:

```json
{
  "title": "2026 상반기 시황 리포트",
  "content": "본문"
}
```

Attachments are uploaded either after post creation or via multipart endpoint.

---

## 13.3 Team Board APIs

### GET `/api/member/teams/ib/posts`

```txt
Access: MEMBER+
board_type: TEAM_IB_OUTPUT
```

### POST `/api/member/teams/ib/posts`

```txt
Access: MEMBER+
board_type: TEAM_IB_OUTPUT
```

Equivalent endpoints:

```txt
/api/member/teams/research/posts → TEAM_RESEARCH_OUTPUT
/api/member/teams/derivatives/posts → TEAM_DERIVATIVES_OUTPUT
/api/member/teams/quant/posts → TEAM_QUANT_OUTPUT
```

No team membership check.

---

## 13.4 Interview API

### GET `/api/member/interviews`

```txt
Access: INTERVIEW_REVIEWER+
board_type: INTERVIEW_REVIEW
```

### POST `/api/member/interviews`

```txt
Access: INTERVIEW_REVIEWER+
board_type: INTERVIEW_REVIEW
attachments: disallowed
```

Request:

```json
{
  "title": "2026 상반기 리서치 RA 면접 후기",
  "content": "본문"
}
```

### GET `/api/member/interviews/[id]`

```txt
Access: INTERVIEW_REVIEWER+
Action: increment view_count, write INTERVIEW_VIEWED audit log
```

---

## 13.5 Common Post APIs

### GET `/api/posts/[id]`

Server:

```txt
1. load post
2. determine policy by post.board_type
3. check readRole
4. return post
```

### PATCH `/api/posts/[id]`

Access:

```txt
AUTHOR_OR_ADMIN
```

Allowed body:

```json
{
  "title": "수정 제목",
  "content": "수정 본문"
}
```

Forbidden body fields:

```txt
- board_type
- category
- tags
- visibility
- author_id
```

### DELETE `/api/posts/[id]`

Soft delete. Access `AUTHOR_OR_ADMIN`.

---

## 13.6 Attachment APIs

### POST `/api/posts/[id]/attachments`

Access:

```txt
AUTHOR_OR_ADMIN for existing post
or create flow scoped to current user
```

Server:

```txt
- load post
- check BOARD_POLICY[board_type].allowAttachments
- reject if INTERVIEW_REVIEW
- validate file type/size
- upload to public/private storage based on board policy
```

### GET `/api/attachments/[id]/download`

Server:

```txt
1. load attachment and post
2. derive policy from post.board_type
3. check download access
4. increment counters
5. audit log private downloads
6. return file or signed URL
```

---

## 13.7 Recruiting APIs

### GET `/api/recruiting/application`

Returns active application metadata.

### GET `/api/recruiting/application/download`

Public download. Increments download count.

### PUT `/api/admin/recruiting/application`

Access: ADMIN. Replaces active file.

### GET `/api/recruiting/materials`

Public list. `board_type = RECRUIT_MATERIAL`.

### POST `/api/admin/recruiting/materials`

Access: ADMIN. `board_type = RECRUIT_MATERIAL`.

---

## 13.8 Admin APIs

```txt
GET    /api/admin/users
POST   /api/admin/users/[id]/approve
POST   /api/admin/users/[id]/reject
PATCH  /api/admin/users/[id]/role
POST   /api/admin/users/[id]/lock
POST   /api/admin/users/[id]/unlock
GET    /api/admin/posts
PATCH  /api/admin/posts/[id]
DELETE /api/admin/posts/[id]
GET    /api/admin/banners
PATCH  /api/admin/banners/[pageKey]
POST   /api/admin/banners/[pageKey]/image
GET    /api/admin/audit-logs
```

All admin APIs require `role = ADMIN`.

---

## 14. Authentication / Session / Security

### 14.1 Password Hashing

```txt
- Argon2id preferred
- bcrypt acceptable
- no plaintext password
- admin cannot view password
```

### 14.2 Session

```txt
- HttpOnly cookie
- Secure in production
- SameSite=Lax or Strict
- session rotation on login
- logout invalidates session
```

### 14.3 Rate Limiting

```txt
- login: per IP + per login_id
- signup: per IP
- file download: per user/IP reasonable throttle
- admin mutation APIs: per admin
```

### 14.4 CSRF

If cookie-based auth is used:

```txt
- CSRF token for POST/PATCH/DELETE
- SameSite cookie
- Origin/Referer validation for admin mutations
```

### 14.5 XSS Defense

If rich text editor is used, sanitize HTML server-side.

Allowed tags:

```txt
p, br, strong, em, u, ul, ol, li, h2, h3, blockquote, a
```

Optional:

```txt
img only if uploaded through controlled image pipeline
```

Blocked:

```txt
script, iframe, object, embed, style, event handlers, javascript: URLs
```

---

## 15. Private Page / Crawling Protection

### 15.1 Protected Routes

```txt
/member/*
/admin/*
/api/member/*
/api/admin/*
/api/attachments/* for private files
```

### 15.2 Server-side Guard

Client-side hiding is not enough. Protected pages must not return private HTML before auth check.

Pseudo:

```ts
export async function requireRole(requiredRole: Role) {
  const session = await getSession();
  const role = session?.user.role ?? "VISITOR";

  if (role === "VISITOR") {
    redirect(`/login?reason=member-only&next=${encodeURIComponent(currentPath)}`);
  }

  if (role === "PENDING_USER") {
    throw new AccessError("관리자 승인 후 이용 가능합니다.");
  }

  if (!hasRoleAtLeast(role, requiredRole)) {
    throw new AccessError("접근 권한이 없습니다.");
  }

  return session;
}
```

### 15.3 Member-only Click UX

When visitor clicks member-only nav:

```txt
1. Do not navigate.
2. Show modal/toast.
3. Exact message: 회원 전용 페이지입니다. 로그인 후 이용해주세요
4. Provide [로그인하기] button.
```

### 15.4 Headers for Private Pages

```txt
X-Robots-Tag: noindex, nofollow, noarchive
Cache-Control: private, no-store, max-age=0
Pragma: no-cache
```

### 15.5 HTML Meta for Private Pages

```html
<meta name="robots" content="noindex,nofollow,noarchive" />
```

### 15.6 robots.txt

```txt
User-agent: *
Disallow: /member/
Disallow: /admin/
Disallow: /api/member/
Disallow: /api/admin/
Disallow: /api/attachments/
```

### 15.7 sitemap.xml

Include only:

```txt
/
/about
/curriculum
/history
/reports
/alumni
/recruiting
/signup
/login
```

Exclude:

```txt
/member/*
/admin/*
/api/*
/member/interviews/*
```

---

## 16. Interview Copy Protection

### 16.1 Scope

Only read pages:

```txt
/member/interviews
/member/interviews/[id]
```

Do not apply to editors:

```txt
/member/interviews/new
/member/interviews/[id]/edit
```

### 16.2 CSS

```css
.interview-protected,
.interview-protected * {
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  -moz-user-select: none;
}

@media print {
  .interview-protected {
    display: none !important;
  }

  body::before {
    content: "면접 후기는 인쇄할 수 없습니다.";
    display: block;
    padding: 40px;
    font-size: 20px;
    font-weight: 700;
  }
}
```

### 16.3 JS Event Blocking

```ts
export function enableInterviewCopyProtection(root: HTMLElement) {
  const block = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const blockKeyboard = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const blocked =
      (event.ctrlKey || event.metaKey) &&
      ["c", "a", "x", "p", "s"].includes(key);

    if (blocked) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  root.addEventListener("copy", block);
  root.addEventListener("cut", block);
  root.addEventListener("contextmenu", block);
  root.addEventListener("dragstart", block);
  root.addEventListener("selectstart", block);
  document.addEventListener("keydown", blockKeyboard);

  return () => {
    root.removeEventListener("copy", block);
    root.removeEventListener("cut", block);
    root.removeEventListener("contextmenu", block);
    root.removeEventListener("dragstart", block);
    root.removeEventListener("selectstart", block);
    document.removeEventListener("keydown", blockKeyboard);
  };
}
```

### 16.4 Watermark

Recommended for detail page:

```txt
{user.name} · {user.loginId} · {viewedAt KST}
```

Purpose:

```txt
- screenshot deterrence
- leak attribution
```

### 16.5 Limitation Statement

```txt
텍스트 드래그/복사 차단은 우회 가능하다. 서버 권한검사, noindex, private cache, audit log가 본 보안 장치이며, 복사 차단은 유출 억제 UX로만 취급한다.
```

---

## 17. File Storage / Upload / Download

### 17.1 Storage Buckets

```txt
public-assets:
- public report attachments
- recruiting materials
- application form
- public banners

private-assets:
- team materials
```

No interview attachments.

### 17.2 Allowed Extensions

```txt
pdf
ppt
pptx
xls
xlsx
doc
docx
hwp
hwpx
jpg
jpeg
png
webp
```

### 17.3 Max Size

```txt
Default: 50MB per file
Admin-configurable later
```

### 17.4 Validation

Client-side:

```txt
- extension
- size
- basic MIME
```

Server-side:

```txt
- extension whitelist
- MIME sniffing
- size limit
- filename sanitize
- checksum optional
- reject HTML/SVG/script-like uploads unless explicitly needed
- virus scan optional but recommended
```

### 17.5 Private Download Flow

```txt
1. User clicks download.
2. GET /api/attachments/[id]/download.
3. Server loads attachment + post.
4. Server checks board policy.
5. Server checks MEMBER+.
6. Server generates signed URL with 30-120 second expiry.
7. Server writes audit log.
8. Server increments download counter.
```

---

## 18. SEO / Public Metadata

### 18.1 Public Pages

Public pages should have normal SEO metadata.

```txt
- title
- description
- canonical
- open graph title
- open graph description
- open graph image
- robots index,follow
```

### 18.2 Private Pages

Private pages:

```txt
- noindex,nofollow,noarchive
- no sitemap
- no public cache
- no private HTML before auth
```

---

## 19. Recommended App Directory Structure

Assuming Next.js App Router style:

```txt
src/
  app/
    (public)/
      page.tsx
      about/page.tsx
      curriculum/page.tsx
      history/page.tsx
      reports/page.tsx
      reports/[id]/page.tsx
      reports/new/page.tsx
      reports/[id]/edit/page.tsx
      alumni/page.tsx
      recruiting/page.tsx
      signup/page.tsx
      login/page.tsx
    member/
      layout.tsx
      teams/
        ib/page.tsx
        ib/[id]/page.tsx
        ib/new/page.tsx
        ib/[id]/edit/page.tsx
        research/page.tsx
        research/[id]/page.tsx
        research/new/page.tsx
        research/[id]/edit/page.tsx
        derivatives/page.tsx
        derivatives/[id]/page.tsx
        derivatives/new/page.tsx
        derivatives/[id]/edit/page.tsx
        quant/page.tsx
        quant/[id]/page.tsx
        quant/new/page.tsx
        quant/[id]/edit/page.tsx
      interviews/
        page.tsx
        [id]/page.tsx
        new/page.tsx
        [id]/edit/page.tsx
    admin/
      layout.tsx
      page.tsx
      users/page.tsx
      posts/page.tsx
      banners/page.tsx
      recruiting/page.tsx
      audit-logs/page.tsx
    api/
      auth/
      reports/
      member/
      admin/
      attachments/
      recruiting/
  components/
    layout/
    navigation/
    sections/
    boards/
    auth/
    member/
    admin/
    ui/
  lib/
    auth/
    authorization/
    board-policy/
    db/
    storage/
    sanitize/
    audit/
    seo/
  styles/
    globals.css
    tokens.css
```

---

## 20. Environment Variables

```txt
DATABASE_URL=
AUTH_SECRET=
COOKIE_NAME=
APP_BASE_URL=

STORAGE_PROVIDER=s3|r2|supabase
S3_BUCKET_PUBLIC=
S3_BUCKET_PRIVATE=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=

MAX_UPLOAD_MB=50
SIGNED_URL_TTL_SECONDS=90

ADMIN_SEED_LOGIN_ID=
ADMIN_SEED_PASSWORD=
```

Production rule:

```txt
- seed admin password must be rotated after first login
- never commit env files
```

---

## 21. Seed Data

### 21.1 Admin Seed

```txt
- role = ADMIN
- name = 회장
- login_id from env
- password hash from env initial password
```

### 21.2 Banner Seed

Seed each `page_key` with default placeholder image key.

```txt
home
about
curriculum
history
reports
alumni
recruiting
member
interviews
admin
```

### 21.3 Demo Posts

In development only:

```txt
- 2 public reports
- 2 team materials per board
- 2 interview reviews
- 2 recruit materials
```

Do not seed demo data in production unless explicitly approved.

---

## 22. Codex Implementation Plan

### Phase 0. Repository Bootstrap

Tasks:

```txt
0.1 Initialize TypeScript app.
0.2 Add formatter/linter.
0.3 Add DB client/ORM.
0.4 Add env schema validation.
0.5 Add base layout.
0.6 Add CI checks: typecheck, lint, test.
```

Acceptance:

```txt
- app starts locally
- env validation fails loudly when required vars are missing
- CI passes on empty baseline
```

### Phase 1. Design System

Tasks:

```txt
1.1 Add color tokens.
1.2 Add typography tokens.
1.3 Implement Button, Input, Textarea, Modal, Toast.
1.4 Implement Header.
1.5 Implement MobileDrawer.
1.6 Implement SubHero.
1.7 Implement SubNavigation.
1.8 Implement Footer.
1.9 Implement responsive container utilities.
```

Acceptance:

```txt
- Hanyang Blue visual system applied
- no red accent remains except error states
- desktop and mobile header work
- member-only click modal displays exact message
```

### Phase 2. Auth / Role / Admin Approval

Tasks:

```txt
2.1 Create users table.
2.2 Implement password hashing.
2.3 Implement signup.
2.4 Implement login/logout.
2.5 Implement session middleware.
2.6 Implement role hierarchy.
2.7 Implement admin user approval.
2.8 Implement pending user screen.
2.9 Implement admin role editor.
```

Acceptance:

```txt
- signup has no team field
- new user role = PENDING_USER
- PENDING_USER cannot access /member/*
- ADMIN can approve to MEMBER
- ADMIN and SUPER_ADMIN are not separated
```

### Phase 3. Public Pages

Tasks:

```txt
3.1 Home page without recent reports.
3.2 About page.
3.3 Curriculum page.
3.4 History page.
3.5 Alumni page.
3.6 Recruiting page.
3.7 Public metadata and sitemap.
```

Acceptance:

```txt
- sub hero + breadcrumb + sub navigation pattern used
- Home has no recent reports
- recruiting application is file download only
- public pages indexable
```

### Phase 4. Board Engine

Tasks:

```txt
4.1 Create posts table.
4.2 Create board policy module.
4.3 Implement BoardList.
4.4 Implement BoardSearch.
4.5 Implement BoardPagination.
4.6 Implement PostEditor.
4.7 Implement route-derived board_type creation.
4.8 Implement author/admin edit/delete.
```

Acceptance:

```txt
- no category/tag/visibility UI
- board_type not accepted from user input
- write button appears at table bottom
- correct board_type per route
- author/admin edit policy works
```

### Phase 5. Attachments / Storage

Tasks:

```txt
5.1 Create attachments table.
5.2 Implement public uploads.
5.3 Implement private uploads.
5.4 Implement public download.
5.5 Implement private signed URL download.
5.6 Implement download count.
5.7 Implement upload validation.
5.8 Reject attachments for INTERVIEW_REVIEW.
```

Acceptance:

```txt
- public report downloads work for visitor
- team material downloads require MEMBER+
- private storage direct object URL is not exposed
- interview review attachments rejected
```

### Phase 6. Member Pages

Tasks:

```txt
6.1 Implement /member layout guard.
6.2 Implement IB board page.
6.3 Implement Research board page.
6.4 Implement Derivatives board page.
6.5 Implement Quant board page.
6.6 Implement member noindex headers.
```

Acceptance:

```txt
- all MEMBER+ can access all team pages
- no team permission checks
- no team intro or curriculum summary
- private pages not cached/indexed
```

### Phase 7. Interview Reviews

Tasks:

```txt
7.1 Implement INTERVIEW_REVIEWER guard.
7.2 Implement interview board list.
7.3 Implement interview detail.
7.4 Implement interview create/edit with title/content only.
7.5 Implement copy protection.
7.6 Implement watermark.
7.7 Implement INTERVIEW_VIEWED audit log.
```

Acceptance:

```txt
- MEMBER cannot access interview reviews
- INTERVIEW_REVIEWER can access
- title/content only
- no attachments
- text drag and Ctrl+C blocked on read pages
- noindex/noarchive headers applied
```

### Phase 8. Admin CMS

Tasks:

```txt
8.1 Admin dashboard.
8.2 User approval table.
8.3 User role editor.
8.4 Post management table.
8.5 Banner manager.
8.6 Recruiting application manager.
8.7 Recruiting material manager.
8.8 Audit log table.
```

Acceptance:

```txt
- ADMIN can operate site without developer
- banner images uploadable
- active application file replaceable
- role changes auditable
```

### Phase 9. Security / QA / Deployment

Tasks:

```txt
9.1 Add security headers.
9.2 Add robots.txt.
9.3 Add sitemap exclusion.
9.4 Add protected route tests.
9.5 Add upload security tests.
9.6 Add permission tests.
9.7 Add responsive visual QA.
9.8 Add production deployment checklist.
```

Acceptance:

```txt
- private route direct access blocked
- private HTML not returned to visitors
- private attachments not downloadable by visitors
- sitemap excludes member/admin
- robots disallows member/admin/api private areas
```

---

## 23. Testing Plan

### 23.1 Unit Tests

```txt
- role hierarchy
- board policy
- route → board_type mapping
- canEditPost
- upload validation
- login validation
- signup validation
```

### 23.2 Integration Tests

```txt
- signup → pending user
- admin approval → member
- member creates public report
- visitor downloads public report
- visitor cannot access team page
- member downloads team attachment
- member cannot access interview review
- interview reviewer creates review
- admin edits any post
```

### 23.3 Security Tests

```txt
- /member/* no session redirect
- /admin/* no admin forbidden
- private page has X-Robots-Tag
- private page has Cache-Control no-store
- sitemap excludes protected routes
- robots.txt contains protected disallow
- attachment endpoint checks board policy
- payload board_type tampering ignored
- category/tags/visibility payload ignored/rejected
```

### 23.4 UI Tests

```txt
- header desktop
- header mobile drawer
- member-only click modal exact text
- board list mobile card layout
- write button visibility by role
- SubHero responsive crop
- recruiting application download CTA
- interview copy protection active only read pages
```

### 23.5 Regression Cases

```txt
- PENDING_USER cannot create post
- MEMBER can write to any team board
- MEMBER cannot view interview
- INTERVIEW_REVIEWER can still write public report and team material
- ADMIN count remains one if DB constraint enabled
- deleting post soft-deletes attachments from list
```

---

## 24. QA Checklist

### 24.1 Functional

```txt
[ ] 회원가입에 팀 필드가 없다.
[ ] 신규 가입자는 PENDING_USER다.
[ ] ADMIN 승인 후 MEMBER가 된다.
[ ] 로그인 실패 시 명확한 오류가 나온다.
[ ] 공개 리포트는 비로그인 열람 가능하다.
[ ] 공개 리포트는 비로그인 다운로드 가능하다.
[ ] 공개 리포트 글쓰기는 MEMBER 이상만 가능하다.
[ ] 글쓰기 버튼은 표 하단 우측에 있다.
[ ] 글쓰기 폼에는 제목/내용/첨부파일만 있다.
[ ] category/tag/visibility 필드가 없다.
[ ] board_type 선택 UI가 없다.
[ ] 팀 자료 페이지에는 팀 소개가 없다.
[ ] 팀 자료 페이지에는 커리큘럼 요약이 없다.
[ ] 모든 MEMBER는 모든 팀 자료 페이지 접근 가능하다.
[ ] 면접 후기는 제목/내용만 있다.
[ ] 면접 후기는 첨부파일 업로드가 없다.
[ ] MEMBER는 면접 후기 접근 불가하다.
[ ] INTERVIEW_REVIEWER는 면접 후기 접근 가능하다.
[ ] 지원서는 파일 다운로드 방식만 있다.
[ ] Home에 최근 공개 리포트 목록이 없다.
```

### 24.2 Design

```txt
[ ] red accent가 제거되었다.
[ ] Hanyang Blue 중심이다.
[ ] header, hero, breadcrumb, sub menu 구조가 일관적이다.
[ ] board row visual hierarchy가 명확하다.
[ ] mobile board card가 깨지지 않는다.
[ ] 배너 이미지가 desktop/mobile에서 적절히 crop된다.
[ ] 회원 전용 페이지는 public 페이지와 구분되는 dark navy tone을 가진다.
```

### 24.3 Security

```txt
[ ] /member/* 비로그인 직접 접근 시 private HTML이 반환되지 않는다.
[ ] /admin/* 비관리자 접근이 차단된다.
[ ] member-only nav click exact text: 회원 전용 페이지입니다. 로그인 후 이용해주세요
[ ] PENDING_USER 접근 메시지: 관리자 승인 후 이용 가능합니다.
[ ] MEMBER의 면접 후기 접근 메시지: 접근 권한이 없습니다.
[ ] member/admin route에 X-Robots-Tag noindex가 있다.
[ ] private route에 Cache-Control no-store가 있다.
[ ] sitemap에 /member, /admin이 없다.
[ ] robots.txt가 /member, /admin, /api protected를 차단한다.
[ ] private file 직접 URL 접근이 불가능하다.
[ ] signed URL 만료 시간이 적용된다.
[ ] 면접 후기 읽기 페이지에서 텍스트 선택이 안 된다.
[ ] 면접 후기 읽기 페이지에서 Ctrl+C가 차단된다.
[ ] 면접 후기 읽기 페이지에서 Ctrl+P가 차단된다.
```

---

## 25. Definition of Done

```txt
[권한]
- role은 VISITOR, PENDING_USER, MEMBER, INTERVIEW_REVIEWER, ADMIN만 사용한다.
- ADMIN과 SUPER_ADMIN을 구분하지 않는다.
- 팀별 권한이 없다.
- 회원 DB에 team이 없다.

[디자인]
- 한양대 블루 계열 디자인이다.
- 고려대 레드 계열 accent가 없다.
- 대형 hero, breadcrumb, sub-menu 구조가 모든 주요 하위 페이지에 적용된다.
- board UI는 레퍼런스 구조를 현대화한다.

[Home]
- 최근 공개 리포트 섹션이 없다.
- 공개 리포트 CTA 버튼 정도만 허용한다.

[리크루팅]
- 지원서는 파일 다운로드 방식만 허용한다.
- 외부 지원 링크가 없다.
- 관리자만 지원서 파일을 교체한다.

[회원 팀 페이지]
- 팀 소개가 없다.
- 커리큘럼 요약이 없다.
- 게시판만 있다.
- 모든 MEMBER 이상이 모든 팀 자료에 접근/작성 가능하다.

[면접 후기]
- 제목과 내용만 있다.
- 첨부파일이 없다.
- INTERVIEW_REVIEWER와 ADMIN만 열람/작성 가능하다.
- 텍스트 드래그, 우클릭, Ctrl+C가 차단된다.
- noindex/nofollow/noarchive가 적용된다.

[글 작성]
- 각 게시판 하단에 글쓰기 버튼이 있다.
- 권한 있는 사용자에게만 글쓰기 버튼이 보인다.
- 글쓰기 진입 시 board_type은 서버에서 자동 고정된다.
- category/tag/visibility 입력이 없다.
- 수정/삭제는 작성자 또는 ADMIN만 가능하다.

[보안]
- 회원 전용 페이지는 서버에서 접근 차단한다.
- 비로그인 회원 전용 클릭 시 정확한 문구를 표시한다.
- private file은 signed URL로만 다운로드한다.
- member/admin URL은 sitemap에서 제외한다.
- robots.txt와 X-Robots-Tag를 적용한다.
- audit log를 기록한다.
```

---

## 26. Risk Register

| Risk | Severity | Mitigation |
|---|---:|---|
| 면접 후기 유출 | High | 서버 권한검사, noindex, no-store, 복사 억제, watermark, audit log |
| public/private 파일 혼동 | High | board policy 기반 storage 결정, private direct URL 금지 |
| board_type 조작 | High | payload board_type 무시, route-derived server assignment |
| team 권한 요구 재발 | Medium | 현재 v1 non-goal로 명시, 문제 발생 시 admin 사후 관리 |
| ADMIN 계정 분실 | High | 인프라 복구 절차 별도 마련, DB-level recovery |
| 배너 이미지 품질 저하 | Medium | desktop/mobile crop preview, alt text 필수 |
| XSS | High | server-side sanitizer, CSP |
| 파일 업로드 악성 파일 | High | whitelist, MIME validation, size limit, optional virus scan |
| 개인정보 과다 노출 | Medium | alumni 공개 필드 opt-in, email/phone never public |

---

## 27. Open Decisions

아래 항목은 개발 전 확정하면 좋지만, 현재 요구사항만으로도 구현은 가능하다.

```txt
1. 학회 공식 명칭: 국문/영문 최종 표기.
2. 로고 파일 제공 여부.
3. 기본 배너 이미지 제공 여부.
4. 공개 alumni 정보 범위.
5. 지원서 파일 형식: docx/pdf/hwp 중 무엇을 기본으로 할지.
6. rich text editor 사용 여부: plain textarea vs editor.
7. 이메일 인증 여부: v1에서는 제외 가능.
8. 운영 서버: Vercel/Supabase/AWS/Cloudflare R2 중 선택.
9. production admin 초기 계정 전달 방식.
10. 리포트 업로드 파일 최대 용량.
```

---

## 28. Recommended MVP Cut

시간을 줄여야 할 경우에도 다음은 절대 삭제하지 않는다.

```txt
Must keep:
- role model
- server-side route protection
- board_type policy
- file storage policy
- admin approval
- public reports
- member team boards
- interview reviewer restriction
- noindex/no-store for private routes
- banner upload
```

줄일 수 있는 항목:

```txt
- Alumni chart sophistication
- History admin editor, initial static seed 가능
- Curriculum admin editor, initial static content 가능
- animation
- watermark density customization
- advanced search ranking
```

---

## 29. Final Build Principle

이 사이트는 단순 정적 홈페이지가 아니라 다음 세 가지가 결합된 시스템이다.

```txt
1. Public-facing institutional website
2. Board-type-based content archive
3. Role-protected member CMS
```

따라서 핵심 추상화는 `Role`과 `BoardType`이다.

```txt
Role decides who the user is.
BoardType decides what the content is and how it is protected.
```

팀은 권한 경계가 아니다. 팀은 자료실 위치와 board_type일 뿐이다.

