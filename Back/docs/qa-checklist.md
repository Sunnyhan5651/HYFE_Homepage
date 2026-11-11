# Final QA Checklist — HyFE Full v1 Local Demo

Run from a fresh local checkout:

```bash
npm install
npm run seed
npm run lint
npm run typecheck
npm test
npm run smoke
npm run build
```

Manual demo evidence checklist:

- [ ] Public pages render: `/`, `/about`, `/curriculum`, `/history`, `/reports`, `/alumni`, `/recruiting`, `/signup`, `/login`.
- [ ] Signup form has no team field and creates `PENDING_USER`.
- [ ] Admin can view pending users and approve via API/admin workflow.
- [ ] Member can create public report and team posts.
- [ ] Visitor can read public reports and use public application download CTA.
- [ ] Visitor/pending cannot access member/admin private content.
- [ ] Member can access every team board; team pages are board-only.
- [ ] Member cannot access interview review; interview reviewer can.
- [ ] Interview read pages apply copy deterrence and watermark; edit/new pages remain editable.
- [ ] Admin can view dashboard/users/posts/banners/recruiting/read-only audit logs.
- [ ] `robots.txt`, `sitemap.xml`, and headers keep member/admin/private APIs non-indexed/non-cached.

Known local-demo boundary:

- No production deployment.
- No real secrets.
- No external object storage or production DB.
- Placeholder/text logo and gradient/banner defaults are intentional until official assets arrive.
