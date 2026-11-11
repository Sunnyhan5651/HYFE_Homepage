# HYFE Website Local Demo

한양대학교 금융공학회 HYFE 웹사이트 로컬 데모입니다.

## Scope

이 프로젝트는 로컬 데모입니다. 실제 프로덕션 비밀값, 외부 DB, 오브젝트 스토리지, 실 도메인 배포 설정은 포함하지 않습니다.

로컬 저장소는 `data/demo-db.json`을 사용합니다. 권한, 게시판, 첨부파일 공개/비공개 저장소, 관리자 승인, 감사 로그 정책을 확인하기 위한 데모 어댑터입니다.

## Setup

```bash
npm install
cp .env.example .env.local
npm run seed
npm run dev
```

Open `http://localhost:3000`.

## Docker Preview

```bash
docker compose up --build
```

Open `http://localhost:3000`.

## Demo Accounts

| Role | ID | Password |
|---|---|---|
| Admin | `admin` | `admin1234` |
| Pending User | `pending` | `pending1234` |
| Member | `member` | `member1234` |
| Interview Reviewer | `interview` | `interview1234` |

These credentials are local-demo placeholders only.

## Verification

```bash
npm run seed
npm run typecheck
npm test
npm run smoke
npm run build
```
