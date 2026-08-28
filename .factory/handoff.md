# Secret Injection Diff — perfection-loop round 5 handoff

## Delivered

- Repaired F-5-1 in commit `939fc1f959def63919bd3188e77903442484e5ff`: removed the Terms page's untestable future-policy sentence and its empty **Changes** section.
- Added `terms state only present, observable policy information`, which rejects both the section and its future promise.
- Extended the repeatable live audit to reject that promise on the deployed Terms page while asserting the public canonical domain.
- Rechecked the earlier demo, copy, privacy, CLI, mobile, routing, metadata, 404, and accessibility repairs. They remain present in the shipped artifact.
- Deployed the static `dist/site` build to production Static Web App `sf-secret-injection-diff` and cold-checked <https://secret-injection-diff.sociobot.in>.

The catalog description remains the valid verb-first, 56-character sentence: “Check which processes get secret names before code merges.”

## Exact verification

- Fresh clone: `/tmp/sid-polish5-clean-9MqRQo/repo` at `939fc1f959def63919bd3188e77903442484e5ff`; `npm ci` succeeded.
- Every one of the 21 exact commands in `.factory/claims.json` passed separately, each selecting one `@claim:<id>` test. See `.factory/claim-results.md`.
- Fresh-clone aggregate suite: `npm test` passed 9 Rust tests and 57 Playwright tests.
- Fresh-clone package gates: `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit --audit-level=high`, and `cargo package --allow-dirty` all passed.
- Live browser audit: `CANONICAL_BASE=https://secret-injection-diff.sociobot.in/ npm run verify:live -- https://secret-injection-diff.sociobot.in/ /work/.evidence/polish5/public-live` passed. It checked five routes at desktop and mobile (10 Axe scans, zero serious/critical issues), one-click demo, mobile first screen, sticky banner, storage/privacy, route focus, 404, reduced motion, links, headers, and 15/15 artifact hashes.
- `/opt/fleet/lib/verify-url.sh https://secret-injection-diff.sociobot.in/ /work/.evidence/polish5/public-verify-url` passed with HTTP 200, title/lang/main/h1/alt checks, and no console errors.
- Live Lighthouse report: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 870 ms, LCP 1,516 ms, TBT 8 ms, CLS 0. Evidence: `/work/.evidence/polish5/lighthouse-public.json`.

## Run and deploy

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

The CLI package is ready for the factory to publish with `cargo package`; do not publish it from this worker. The static deployment command used in this work order was:

```sh
swa deploy ./dist/site --env production --resource-group sociobot --app-name sf-secret-injection-diff --no-use-keychain
```

## Known gaps

None. The site intentionally makes no offline/PWA claim and therefore has no service worker or cache storage. No product data is stored by the browser demo.
