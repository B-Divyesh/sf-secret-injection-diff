# Perfection-loop round 3 handoff — Secret Injection Diff

## Result

**PASS.** Every finding in `.factory/review-1.md`, `.factory/review-2.md`, and `.factory/review-3.md` is resolved and mapped in `.factory/polish-3.md`. The repaired static site is live at <https://secret-injection-diff.sociobot.in>.

## What changed

- The CLI now treats `(secret name, process)` as the approval boundary. Changing only the injection path is reported separately and returns exit code 0; a genuinely new process still returns exit code 2.
- `.factory/claims.json` now contains 21 claims. New clean-fixture tests cover the comparison boundary, non-failing `diff`, every detailed dotenv/Compose/GitHub Actions/Kubernetes form, and redaction of injection changes.
- The browser recording is tied to the real bundled CLI sample. `/?demo=1` redirects to `/demo/?demo=1`; the demo uses only in-memory bundled text, has Reset demo and Start for real, and saves nothing.
- At 390 × 844, the demo’s command, changed process, summary, error, and exit status are visible without scrolling. Its sandbox banner stays visible after scrolling.
- Remaining graph jargon, inconsistent “identifier” wording, and decorative labels were replaced with process, secret name, baseline, supported files, and direct section names.
- Existing route titles, metadata, legal pages, real 404 response, focus handoff, Back behavior, security headers, and original conservatory visual identity were retained and reverified.
- Added `npm run verify:live -- <url> <evidence-dir>` for repeatable deployed-route, accessibility, privacy, focus, demo, header, and artifact-parity checks.

## Verification evidence

- Clean clone: `/tmp/sid-polish3-final-V9flcC/repo` at `231865cd7d89c332fb854cef5913c51f2613ce2f` ran `npm ci`, then every exact command from `.factory/claims.json` separately. Result: 21/21 passed.
- `npm test`: 9 Rust tests and 53 Playwright browser/integration tests passed.
- `npm run lint`: rustfmt, Clippy with `-D warnings`, and ESLint passed.
- `npm run typecheck`: all Rust targets and features passed.
- `npm run build`: produced `dist/site` and `dist/bin/secret-injection-diff`.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `cargo package --allow-dirty`: passed; 62 files, 658.6 KiB unpacked.
- `/opt/fleet/lib/verify-url.sh https://secret-injection-diff.sociobot.in .factory/evidence/polish-3/verify-url`: HTTP 200, correct title/lang/main/h1/alt, and zero console errors.
- `npm run verify:live -- https://secret-injection-diff.sociobot.in .factory/evidence/polish-3/live`: 10 route/viewport audits passed with zero serious/critical Axe violations, zero errors, correct route metadata, no overflow, working focus and legal links, real HTTP 404, and 15/15 deployed files matching `dist/site`.
- Live demo at 390 × 844: terminal top 615.78 px; last result line bottom 722.16 px. After bottom scroll, the sticky banner remained from 0 to 80.14 px with both controls visible.
- Live privacy state: 0 cookies, local/session storage entries, IndexedDB databases, Cache Storage keys, and service-worker registrations; requests used only the product origin.
- Lighthouse 13.0.1 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1,017 ms, LCP 1,506 ms, TBT 0 ms, CLS 0.
- Transfer sizes: JS 1,326 bytes gzip; CSS 2,892 bytes gzip; mobile hero 40,918 bytes; desktop hero 132,680 bytes.

## Deployment

- Work-order build command: `npm ci && npm run build:site`
- Deploy command: `/opt/fleet/lib/deploy-static.sh secret-injection-diff dist/site`
- Azure deployment ID: `6ab3ae8a-eb24-4e2c-9071-73cdd6124a87`
- Deployed implementation: `231865cd7d89c332fb854cef5913c51f2613ce2f`
- Live cold audit: 2026-08-28 UTC

## Known gaps and next steps

None. The site intentionally does not claim browser-offline use and ships no service worker or manifest. The CLI itself and its bundled demo do not require network access.
