# Perfection-loop polish 3 — cumulative finding closure

- Candidate repaired: `d13343334846887fe4a1056b4509bdb2b46af3de`
- Cumulative review repaired: `review-1.md`, `review-2.md`, and `review-3.md` at `a2e7ebc1a38ccf605a770b6fb64c0ceeed0b65a0`
- Deployed implementation commit: `231865cd7d89c332fb854cef5913c51f2613ce2f`
- Live audit tooling commit: `56922b4`
- Live URL: <https://secret-injection-diff.sociobot.in>
- Azure deployment ID: `6ab3ae8a-eb24-4e2c-9071-73cdd6124a87`
- Cold live recheck: 2026-08-28 UTC

All findings from every review are closed. Evidence screenshots are under `.factory/evidence/polish-3/live/`; structured results are in `live/live-audit.json` and `verify-url/verify.json`.

| Finding | Change made | Evidence: test · screenshot · live check |
| --- | --- | --- |
| F-1-1 | Kept the service worker removed and retained the zero-storage privacy contract. | `@claim:site-data-free` · `live/demo-first-screen-mobile.png` · `/demo/?demo=1` had no service workers, Cache Storage, cookies, local/session storage, IndexedDB, or third-party requests; `/sw.js` returned 404. |
| F-1-2 | Retained complete canonical, Open Graph, Twitter, favicon, and Apple icon metadata on the 404 document. | `/404.html has the required document structure` and `every route has its exact title, canonical URL, and legal links` · `live/404-mobile.png` · `/404.html` exposed every field and an unknown URL returned the designed page with HTTP 404. |
| F-1-3 | Retained focus and polite announcements for full-page navigation, Back, and the demo-to-install hash route. | `full-page navigation and browser Back focus and announce the destination heading`; `demo-to-install navigation moves focus, announces the section, and Back restores the demo` · `live/demo-first-screen-mobile.png` · live Home → Demo → Back and Demo → Install focused and announced the expected headings. |
| F-1-4 | Removed the remaining undefined graph language from the landing page, human CLI output, README, and terms. | `visitor copy uses the defined product terms and the 404 heading is plain` · `live/landing-mobile.png` · live copy consistently uses process, secret name, baseline, access, and supported files. |
| F-1-5 | Replaced the remaining README “identifiers” wording with “secret names” and locked all visitor surfaces with a terminology regression. | `visitor copy uses the defined product terms and the 404 heading is plain` · `live/landing-mobile.png` · live landing, privacy, terms, demo, and pushed README use the defined terms. |
| F-1-6 | Kept the unproved numeric Rust minimum out of README and added a regression assertion. | `visitor copy uses the defined product terms and the 404 heading is plain` · `live/landing-desktop.png` · pushed README has no numeric compiler promise. |
| F-1-7 | Kept the documented build contract on `npm run build` and verified both outputs. | `@claim:build-artifacts` · `live/landing-desktop.png` · the deployed site matches `dist/site`, and local build produced `dist/bin/secret-injection-diff`. |
| F-1-8 | Kept separate checks for exit codes 0, 1, and 2 and updated the human output to process language. | `@claim:check-no-change-exit-zero`, `@claim:invalid-input-exit-one`, `@claim:scope-change` · `live/demo-first-screen-mobile.png` · the live sample shows the real exit-2 result. |
| F-2-1 | Verified normal route changes and Back/Forward focus the destination `<h1>` and update the live region. | `full-page navigation and browser Back focus and announce the destination heading` · `live/demo-first-screen-mobile.png` · repeated against the deployed origin by `npm run verify:live`. |
| F-2-2 | Kept first-screen wording limited to the observable “secret name,” with no runtime credential claim. | `visitor copy uses the defined product terms and the 404 heading is plain` · `live/landing-mobile.png` · live headline, lede, facts, and action explanation use “secret name.” |
| F-2-3 | Kept the direct 404 heading “Page not found” and replaced the remaining decorative eyebrow with “Error 404.” | `/404.html has the required document structure`; `visitor copy uses the defined product terms and the 404 heading is plain` · `live/404-mobile.png` · an unknown live URL returned HTTP 404 with the plain heading and Return home link. |
| F-3-1 | Changed comparisons to gate by `(secret name, process)`. Injection-path refactors now appear in `injection_changes` and human output without exit 2. | `@claim:scope-change`, `@claim:same-recipient-injection-change-exit-zero`, Rust test `injection_change_keeps_the_same_process_approved` · `live/demo-first-screen-mobile.png` · live demo still shows a true new-process failure; the exact Compose refactor exits 0 locally. |
| F-3-2 | Compressed the demo’s mobile heading rhythm and terminal so the command, `NPM_TOKEN` addition, summary, error, and exit 2 fit immediately. | `mobile demo shows the real command, result, and exit status in its first viewport` · `live/demo-first-screen-mobile.png` · live terminal top `615.78px` and last line bottom `722.16px` in an `844px` viewport. |
| F-3-3 | Made the demo banner sticky with collision-safe stacking while retaining Reset demo and Start for real. | `demo banner and sandbox controls stay visible after mobile scrolling` · `live/demo-bottom-mobile.png` · after a real bottom scroll, the live banner remained at top `0px`, bottom `80.14px`, with both controls visible. |
| F-3-4 | Rewrote remaining visitor and human CLI terms: process access replaces recipient/edge/graph language; supported files replaces adapters; files from another domain replaces runtime CDN. | `visitor copy uses the defined product terms and the 404 heading is plain` · `live/landing-mobile.png` · deployed pages contain none of the rejected terms. |
| F-3-5 | Changed `.env` documentation from uppercase identifiers to uppercase secret names and included README in the regression. | `visitor copy uses the defined product terms and the 404 heading is plain` · `live/landing-desktop.png` · pushed README uses “secret names.” |
| F-3-6 | Registered and tested that `diff` prints a genuine addition and exits 0. | `@claim:diff-addition-exit-zero` · `live/demo-first-screen-mobile.png` · live recording shows the same addition; clean-clone CLI test proves the non-failing status. |
| F-3-7 | Registered detailed dotenv behavior for `.env`, `.env.*`, uppercase names, invalid names, and unrelated files. | `@claim:dotenv-capability` · `live/landing-desktop.png` · live supported-files section links the claim to the shipped CLI documentation. |
| F-3-8 | Registered all documented Compose forms, including both `env_file` shapes and both service-secret shapes. | `@claim:compose-capability` · `live/landing-desktop.png` · live supported-files section identifies Docker Compose; clean-clone fixtures prove every documented form. |
| F-3-9 | Registered GitHub Actions job env, step env, and reusable-workflow inheritance. | `@claim:github-actions-capability` · `live/demo-first-screen-mobile.png` · live demo shows the tested GitHub Actions step result. |
| F-3-10 | Registered Kubernetes `secretKeyRef`, `envFrom.secretRef`, mounted secret volumes, and negative ConfigMap coverage. | `@claim:kubernetes-capability` · `live/landing-desktop.png` · live supported-files section identifies Kubernetes; clean-clone fixtures prove all forms. |
| F-3-11 | Replaced “Specimen 02” with “Sample result.” | `visitor copy uses the defined product terms and the 404 heading is plain` · `live/landing-mobile.png` · revised label is live. |
| F-3-12 | Replaced “Field method” with “How it works.” | same terminology regression · `live/landing-mobile.png` · revised label is live. |
| F-3-13 | Replaced “Known terrain” with “Supported files.” | same terminology regression · `live/landing-mobile.png` · revised label is live. |
| F-3-14 | Replaced “Outside the fence” with “Limits.” | same terminology regression · `live/landing-mobile.png` · revised label is live. |
| F-3-15 | Removed generated CSS jargon and added the semantic figure caption “Secret names mapped to processes.” | same terminology regression includes `styles.css` · `live/landing-mobile.png` · live caption is visible and available to assistive technology. |
| F-3-16 | Replaced “each half” with “Build and test the CLI and documentation site separately.” | same terminology regression includes README · `live/landing-desktop.png` · pushed README contains the direct transition. |

## Cumulative verification

- Clean clone `/tmp/sid-polish3-final-V9flcC/repo` at `231865cd7d89c332fb854cef5913c51f2613ce2f`: `npm ci` and all 21 exact claim commands passed separately.
- Current checkout: `npm test` passed 9 Rust and 53 Playwright tests; `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit --audit-level=high`, and `cargo package --allow-dirty` passed.
- Live audit: ten Axe scans across five routes and two viewports found zero serious/critical violations, zero console/page errors, correct metadata, no horizontal overflow, and working legal links.
- `/opt/fleet/lib/verify-url.sh` passed against the cold live root. The live audit matched all 15 deployed runtime files byte-for-byte with `dist/site`.
- Lighthouse 13.0.1 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1,017 ms, LCP 1,506 ms, TBT 0 ms, CLS 0.
- Transfer budgets: initial JS 1,326 bytes gzip; CSS 2,892 bytes gzip; mobile hero 40,918 bytes; desktop hero 132,680 bytes; no font download.
- Offline/PWA boundary: the site makes no offline claim and intentionally has no service worker, web manifest, or Cache Storage. The CLI and bundled CLI demo require no network.
