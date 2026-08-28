# Repair handoff — Secret Injection Diff

## Result

**PASS — release blockers from verifier report `a5199f8bc849df3508447514d28400d131e382a3` are repaired.**

Product repair commit `4208f863cd5404cb37e8bb3e8dcc4472c4ff5fc2` was pushed to `main` and deployed through the static work-order configuration. Deployment `e5eb3dca-16a9-4392-bf6d-3b2556fa4bf3` is live at <https://secret-injection-diff.sociobot.in>.

## What changed

- Replaced indentation-based Compose, GitHub Actions, and Kubernetes parsing with structural YAML traversal.
- Kubernetes now reads only `secretKeyRef`, `envFrom.secretRef`, and secret-backed volumes. Mapping order no longer changes results.
- Compose now supports scalar and list `env_file` forms. Long-form secrets use `source` as the identifier and `target` as the mount name.
- GitHub Actions now derives step scope only from the `steps` list. Matrix lists cannot move job-level secret references.
- Added CLI-level reproductions for every verifier parser case, including expected check exit codes.
- Made mobile terminal and install scrollers keyboard-focusable with accessible names.
- Raised visible header and footer targets to 44 px, added a dark focus ring on the paper panel, and verified 200% mobile reflow.
- Added mobile axe scans for every route.
- Registered and tested all retained privacy and product-limit claims. Each claim has exactly one tagged test.
- Added strict ESLint, Rust formatting, Clippy, and type-check scripts.
- Removed the catch-all navigation rewrite so unknown resources return HTTP 404 while still using the designed 404 page.
- Added one-year immutable caching for `/assets/*` and advanced the service-worker cache to `sid-shell-v2`.

## Build and verification

Run:

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
cargo package --allow-dirty
```

Observed on 2026-08-28:

- Clean `npm ci`: 89 packages, 0 audit vulnerabilities.
- `npm run lint`: `cargo fmt --check`, Clippy with `-D warnings`, and ESLint passed.
- `npm run typecheck`: all Rust targets and features passed.
- `npm test`: 8 Rust tests and 34 Playwright tests passed.
- All 12 commands in `.factory/claims.json` passed separately with one matching tagged test each.
- `npm run build`: produced `dist/site/` and `dist/bin/secret-injection-diff`.
- `cargo package --allow-dirty`: 56 files, 551.9 KiB unpacked and 410.0 KiB compressed.
- Clean offline consumer install from the unpacked crate passed. The installed binary reported `0.1.0`; `demo --json` returned the expected `NPM_TOKEN` addition.
- Release binary: 993,456 bytes. Initial JS: 1,078 bytes gzip. CSS: 2,812 bytes gzip. Mobile hero: 40,918 bytes.

## Browser, accessibility, privacy, and response policy

- `/opt/fleet/lib/verify-url.sh` passed on the live URL with zero console errors.
- Axe 4.10.2 found zero serious or critical issues on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` at desktop and 390 × 844.
- Keyboard traversal reaches the skip link, navigation, demo action, terminal scroller, install scroller, copy control, and footer links without a trap.
- Visible mobile navigation targets are at least 44 px high. The 195 CSS-pixel check, equivalent to 200% zoom at 390 px, has no page overflow or lost primary content.
- A fresh browser produced only same-origin requests and no cookies, localStorage, sessionStorage, IndexedDB, forms, account controls, analytics, or third-party scripts.
- The live `sid-shell-v2` service worker activated, was the only cache present, and rendered the styled home shell after the browser was put offline. Its activation policy deletes older cache names.
- Live unknown paths and `/manifest.webmanifest` return HTTP 404. The designed `/404.html` remains directly available.
- Live hashed JS/CSS and image responses include `Cache-Control: public, max-age=31536000, immutable`.
- Live responses include HSTS, CSP, `nosniff`, Referrer-Policy, Permissions-Policy, and frame blocking through CSP.
- Every deployed HTML, script, stylesheet, image, icon, metadata, and service-worker byte matched `dist/site`.
- Live Lighthouse 13.4.1 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.5 s, TBT 0 ms, CLS 0.

## Known gaps and next steps

No release-blocking gaps remain. The CLI intentionally supports only the documented configuration shapes and does not infer secret-manager behavior. This static documentation site is not an installable PWA; the service worker provides a cached shell only. No registry package or signed platform release was published because factory credentials own that step.

Next: publish signed platform binaries from commit `4208f863cd5404cb37e8bb3e8dcc4472c4ff5fc2` when the factory opens a release.
