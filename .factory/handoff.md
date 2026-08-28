# Repair handoff — Secret Injection Diff

## Result

**PASS — all eight findings from adversarial review 1 are fixed, deployed, and cold-checked. Nothing is deferred.**

Repair commit `9cf68ab0f7ffad50a4a582ec5375c8d52ae1d881` was pushed to `origin/main` and deployed through the static work-order configuration to <https://secret-injection-diff.sociobot.in>.

## What was done

- Removed the service worker and its shell cache. The privacy claim now tests registrations and Cache Storage as well as cookies, local/session storage, IndexedDB, forms, accounts, analytics, and request origins.
- Added one-click `/demo/?demo=1` and `/?demo=1` sample entry, persistent demo banner, reset feedback, direct sample content, and install-heading focus/announcement.
- Completed 404 metadata and expanded route-head tests across home, demo, privacy, terms, and 404.
- Rewrote the first screen and section copy in process language. “Secret name” is now the consistent sensitive-label term.
- Removed the unsupported Rust minimum. Added real build-artifact and exit 0/1 claims and tests.
- Updated the catalog description, demo contract, claims record/results, copy audit, quality evidence, and finding map.

## Verification result

- Clean clone: `/tmp/sid-polish-clean-jThVZQ` at repair commit; `npm ci` passed with 0 vulnerabilities.
- Every one of the 15 exact `.factory/claims.json` commands passed separately with exactly one matching tagged test.
- `npm test`: 8 Rust tests and 40 Playwright tests passed.
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit --audit-level=high`, and `cargo package --allow-dirty` passed.
- Build outputs: `dist/site/index.html` and `dist/bin/secret-injection-diff`; crate package 583.9 KiB unpacked / 417.1 KiB compressed.
- Live `verify-url.sh` passed with no console errors. All five routes passed axe at desktop and 390 px with zero serious/critical violations.
- Live privacy: product-origin requests only; 0 cookies, 0 local/session/IndexedDB entries, 0 Cache Storage keys, and 0 service-worker registrations.
- Live routing: home/demo/privacy/terms/404 return 200; unknown route and `/sw.js` return 404; all rendered links return 200.
- Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; FCP 851 ms, LCP 1,566 ms, TBT 0 ms, CLS 0.
- Budgets: JS 1,286 bytes gzip; CSS 2,812 bytes gzip; mobile hero 40,918 bytes; desktop hero 132,680 bytes; fonts 0 bytes.

Full finding-to-evidence mapping is in `.factory/polish-1.md`. Screenshots and raw verifier/Lighthouse results are under `.factory/evidence/polish-1/` in the worker evidence volume.

## Remaining work

None. The site makes no offline-use claim, and removing the unneeded service worker is the privacy fix; offline/PWA acceptance is not applicable. Registry publishing remains factory-owned and was not performed.
