# Independent product verification — PASS

- Candidate commit: `54e16879752318518e22279a12eb4db739740827`
- Live URL: <https://secret-injection-diff.sociobot.in>
- Verified: 2026-08-28 UTC
- Work order: `secret-injection-diff-verify-3`
- Verdict: **PASS — release candidate accepted**

This was a fresh, independent verification of the candidate, including a clean dependency install, every declared claim command, a production rebuild, a clean-consumer CLI install, and live-browser checks. The deployed public files byte-match this locally rebuilt candidate.

## First-read and demo gate

**Pass.** A cold live desktop load says, in plain words:

- What it does: “Prove which process gets each secret”.
- Who it is for: developers reviewing CI and deploy changes before an unexpected process gains a credential.
- What to click first: **Try it with sample data**.

The primary action is visible in the 390 x 844 first viewport and opens `/demo/` with one keyboard `Enter` activation. The demo immediately shows the bundled `NPM_TOKEN` recipient addition and exit 2. Its persistent banner says “Demo — sample data, nothing is saved”, offers **Reset demo** and **Start for real**, and both replay/reset actions work by keyboard. The CLI `demo --json` uses a new operating-system temporary directory and returns the same one-edge scenario.

## Required claims gate

`.factory/claims.json` exists and contains 12 claims. After `npm ci` from the clean candidate, every exact declared command was run and passed; each selected one matching tagged Playwright test.

| Claim | Result |
| --- | --- |
| `adapters` | Pass |
| `scope-change` | Pass |
| `values-excluded` | Pass |
| `redaction` | Pass |
| `isolated-demo` | Pass |
| `json-output` | Pass |
| `no-network` | Pass |
| `free-mit` | Pass |
| `no-decryption-storage` | Pass |
| `snapshot-only-write` | Pass |
| `site-data-free` | Pass |
| `explicit-adapter-limits` | Pass |

The claim tests cover the four documented adapters, exit 2 on a new recipient, value exclusion, stable redaction, demo isolation, stable JSON, same-origin browser traffic/no CLI client, MIT status, no output-file writes except `snapshot`, no browser storage, and refusal to infer Vault/SOPS-style configuration.

## Local quality gates and CLI verification

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 89 packages installed, 0 audit vulnerabilities |
| `npm audit --audit-level=high` | Pass; 0 vulnerabilities |
| `npm run lint` | Pass; rustfmt, Clippy with `-D warnings`, ESLint |
| `npm run typecheck` | Pass; all Rust targets/features |
| `npm test` | Pass; 8 Rust tests and 34 Playwright tests (`test-results/.last-run.json`: passed) |
| `npm run build` | Pass; produced `dist/site` and `dist/bin/secret-injection-diff` |
| `cargo package --allow-dirty` | Pass; packaged 56 files, 556.5 KiB unpacked |
| Clean consumer | Pass; unpacked crate installed offline and public binary executed |

The installed consumer binary reports `secret-injection-diff 0.1.0`; `--help` documents `scan`, `snapshot`, `diff`, `check`, and `demo`; `demo --json` returns the expected `NPM_TOKEN` edge. Independent CLI exercise of the bundled before/after configuration found 10 baseline edges and one new GitHub Actions recipient. `check --json` returned that edge and exit code 2; `diff --redact --json` returned a stable `secret_39225bb4` identifier and exit 0. Missing scan paths and baselines return clear errors and exit 1. A duplicate snapshot is refused (exit 1); `--force` recovers as documented.

The full test suite includes independent regression coverage for normal and boundary syntax: ConfigMaps are ignored while reordered Kubernetes `secretKeyRef` fields are found; scalar Compose `env_file` maps to its service; long-form Compose secrets use `source`; and GitHub matrix entries do not change a job-level recipient.

## Live site, accessibility, privacy, and performance

- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, valid title/lang/main/h1/alt checks, no browser console errors.
- Direct live Playwright scans at desktop (1440 x 900) and mobile (390 x 844) for `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` each found exactly one `h1` and `main`, no page/console errors, and **zero axe-core 4.10.2 serious or critical violations**.
- Mobile has no document horizontal overflow. The demo terminal exposes `tabindex="0"` and its accessible name; replay/reset keyboard behavior succeeds. Reduced motion makes scrolling `auto`, hides the travelling capsule, and reduces transitions to `0.01ms`.
- Fresh-context browser traffic during every route and demo interaction was only `https://secret-injection-diff.sociobot.in`. No cookies, localStorage, sessionStorage, IndexedDB records, forms, or account controls were present. Source/dependency inspection found no runtime CLI network or telemetry client.
- Browser response headers include CSP restricted to `self`, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, Permissions-Policy, and frame blocking. Hashed JS/CSS/images are `public, max-age=31536000, immutable`. An unknown route and `/manifest.webmanifest` return HTTP 404; the unknown route renders the designed 404 page.
- All 15 deployed HTML/runtime asset bytes checked (`/`, legal/demo pages, 404, JS, CSS, images, icons, robots, sitemap, and service worker) match `dist/site` byte-for-byte. This confirms the live deployment matches the candidate build.
- Initial gzip sizes: JS 1,078 bytes; CSS 2,809 bytes. Responsive mobile hero: 40,918 bytes. All are inside the specified budgets. Live Lighthouse 13.4.1 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.5 s, TBT 70 ms, CLS 0.

This is a static documentation/demo site for a CLI, not an installable PWA: there is no web manifest and it makes no offline claim. It has a small shell cache service worker, but PWA update/offline acceptance is not applicable. There are no server-side product endpoints, unlock calls, authentication, payment, or sign-in flows, so rate-limit, persistence/concurrency, and Entra-tenant checks are not applicable.

## Defects by severity

None found. No release-blocking, high, medium, or low defects were observed in this candidate.
