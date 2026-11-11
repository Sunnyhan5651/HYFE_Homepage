# Architecture Invariant Audit Source

Source artifacts:

- `.omx/ultragoal/brief.md`
- `.omx/ultragoal/goals.json`
- `.omx/plans/plan-hyfe-full-v1-local-demo.md`
- `.omx/specs/deep-interview-website-development.md`
- `plan.md`

Required invariants:

1. `Role` hierarchy is centralized and only uses `VISITOR`, `PENDING_USER`, `MEMBER`, `INTERVIEW_REVIEWER`, `ADMIN`.
2. `BoardType` policy is centralized and route-derived; user payload cannot select `board_type`, `category`, `tag`, or `visibility`.
3. Team names are board locations, not authorization boundaries; every `MEMBER+` can access all team boards.
4. Interview reviews are `INTERVIEW_REVIEWER+`, title/content only, no attachments, copy deterrence on read pages only.
5. Audit logs are append-only/read-only event history; no edit/delete scope exists.
6. Local JSON/filesystem persistence is a disposable local-demo adapter preserving domain invariants.
7. Private member/admin/API/attachment areas are excluded from sitemap/robots and get noindex/no-store headers.
8. No production deployment, real secrets, external application forms, pixel-perfect reference clone, or extra integrations.

Proof map:

- Implementation evidence: `src/lib/authorization/roles.ts`, `src/lib/board-policy/*`, `src/lib/db/*`, `src/lib/storage/*`, `src/app/robots.ts`, `src/app/sitemap.ts`, `next.config.ts`, member/interview/admin routes.
- Test evidence: `tests/domain-policy.test.ts`, `tests/g004-flows.test.ts`, `tests/security.test.ts`, `scripts/smoke.ts`.
- Review evidence: final independent `code-reviewer` and `architect` reports under `.omx/reviews/`.
