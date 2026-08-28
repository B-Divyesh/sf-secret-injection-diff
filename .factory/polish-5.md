# Perfection-loop round 5 — cumulative finding closure

- Review repaired: `3ef4a9dbcaefd0d368471b73ca6e272f9d27baca`
- Product repair commit: `939fc1f959def63919bd3188e77903442484e5ff`
- Deployment: production Static Web App `sf-secret-injection-diff`
- Public URL: <https://secret-injection-diff.sociobot.in>
- Cold live evidence: `/work/.evidence/polish5/public-live/live-audit.json`

Every finding in `review-1.md` through `review-5.md` was checked again after deployment. Evidence shorthand below: **live audit** is `npm run verify:live` against the public URL; it includes screenshots at `/work/.evidence/polish5/public-live/` and checks 15 deployed artifacts byte-for-byte.

| Finding | Change made | Evidence: test · screenshot · cold live check |
| --- | --- | --- |
| F-1-1 | Removed the service worker/cache implementation; privacy copy and claim now promise no browser storage. | `@claim:site-data-free` · `demo-first-screen-mobile.png` · live audit found zero service workers, Cache Storage keys, cookies, local/session storage, or IndexedDB records. |
| F-1-2 | Completed the 404 head with canonical, OG/Twitter, favicon, and Apple touch metadata. | `/404.html has the required document structure` · `404-mobile.png` · live `/404.html` exposes complete metadata and unknown routes render it with HTTP 404. |
| F-1-3 | Focused and announced destinations for hash navigation, full routes, and browser Back. | `full-page navigation and browser Back focus and announce the destination heading` · `demo-first-screen-mobile.png` · live audit verified Demo, Back, and Start for real focus handoff. |
| F-1-4 | Replaced undefined graph terms in landing copy with process/access language. | `visitor copy uses the defined product terms and the 404 heading is plain` · `landing-mobile.png` · public first screen uses “process” and “secret name.” |
| F-1-5 | Standardized the sensitive concept as “secret name.” | same visitor-copy regression · `landing-mobile.png` · public landing, demo, legal pages, and README use the defined term. |
| F-1-6 | Removed the untestable numeric Rust-version promise. | visitor-copy regression · `landing-desktop.png` · README contains no compiler-minimum claim. |
| F-1-7 | Documented `npm run build` and registered the two artifacts it creates. | `@claim:build-artifacts` · `landing-desktop.png` · clean build created `dist/site` and `dist/bin/secret-injection-diff`. |
| F-1-8 | Registered observable exit-0 and exit-1 coverage alongside exit 2. | `@claim:check-no-change-exit-zero`, `@claim:invalid-input-exit-one`, `@claim:scope-change` · `demo-first-screen-mobile.png` · public demo shows the true exit-2 case. |
| F-2-1 | Added pageshow and hash focus/announcement behavior. | `full-page navigation and browser Back focus and announce the destination heading` · `landing-mobile.png` · cold public navigation and Back passed in live audit. |
| F-2-2 | Removed the broader credential wording; the first screen states only observable secret-name access. | visitor-copy regression · `landing-mobile.png` · public h1, lede, fact, and CTA explanation use “secret name.” |
| F-2-3 | Replaced the 404 pun with “Page not found.” | visitor-copy regression · `404-mobile.png` · public unknown URL returns that plain h1. |
| F-3-1 | Gate comparisons by secret name plus process; delivery-method changes report without exit 2. | `@claim:same-recipient-injection-change-exit-zero` · `demo-first-screen-mobile.png` · exact Compose refactor exits 0; public demo shows a real process addition. |
| F-3-2 | Tightened the mobile demo so real command, change, error, and exit status are visible immediately. | `mobile demo shows the real command, result, and exit status in its first viewport` · `demo-first-screen-mobile.png` · terminal top 615.78 px; final line bottom 722.16 px in an 844 px viewport. |
| F-3-3 | Made the demo notice sticky with both controls always visible. | `demo banner and sandbox controls stay visible after mobile scrolling` · `demo-bottom-mobile.png` · public banner remained 0–80.14 px after bottom scroll. |
| F-3-4 | Replaced remaining graph language in visitor and human CLI output. | visitor-copy and `human CLI output uses process and access language` · `landing-mobile.png` · live audit and copy regressions reject the old terms. |
| F-3-5 | Replaced README “identifiers” with “secret names.” | visitor-copy regression · `landing-desktop.png` · deployed/documented terminology is consistent. |
| F-3-6 | Registered the non-failing `diff` addition behavior. | `@claim:diff-addition-exit-zero` · `demo-first-screen-mobile.png` · clean clone proves its zero exit. |
| F-3-7 | Registered standalone dotenv declarations and Compose `env_file` binding behavior. | `@claim:dotenv-capability` · `landing-desktop.png` · clean fixture distinguishes declaration from process access. |
| F-3-8 | Registered all documented Compose delivery forms. | `@claim:compose-capability` · `landing-desktop.png` · clean fixture covers environment, scalar/list `env_file`, and both secret forms. |
| F-3-9 | Registered GitHub Actions job/step/inheritance behavior. | `@claim:github-actions-capability` · `demo-first-screen-mobile.png` · live sample is the tested GitHub Actions case. |
| F-3-10 | Registered Kubernetes secret forms and ConfigMap exclusion. | `@claim:kubernetes-capability` · `landing-desktop.png` · clean fixture proves all three secret forms and negative ConfigMap case. |
| F-3-11 | Replaced “Specimen 02” with “Sample result.” | visitor-copy regression · `landing-mobile.png` · label is public. |
| F-3-12 | Replaced “Field method” with “How it works.” | visitor-copy regression · `landing-mobile.png` · section is public. |
| F-3-13 | Replaced “Known terrain” with “Supported files.” | visitor-copy regression · `landing-mobile.png` · section is public. |
| F-3-14 | Replaced “Outside the fence” with “Limits.” | visitor-copy regression · `landing-mobile.png` · section is public. |
| F-3-15 | Removed CSS-only jargon and added the semantic process-mapping caption. | visitor-copy/document-structure regressions · `landing-mobile.png` · caption is visible and semantic on the public page. |
| F-3-16 | Rewrote the vague README transition to name the CLI and documentation site. | visitor-copy regression · `landing-desktop.png` · README now reads “Build and test the CLI and documentation site separately.” |
| F-4-1 | Modelled standalone dotenv entries as declarations, not processes. | `@claim:dotenv-capability` · `landing-mobile.png` · comparison ignores declarations until a supported binding names a process. |
| F-4-2 | Replaced predictable hashes with per-output opaque sequential labels. | `@claim:redaction` · `demo-first-screen-mobile.png` · 200 clean-fixture names redact uniquely without raw names. |
| F-4-3 | Added an observable syscall recorder around every CLI action. | `@claim:no-network` · `demo-first-screen-mobile.png` · no socket/connect/send/DNS activity and public browser traffic remains same-origin. |
| F-4-4 | Fit all three plain facts inside the mobile first screen. | `all three plain facts finish in the first 390px screen` · `landing-mobile.png` · public bottoms are 657.13, 702.13, and 747.13 px. |
| F-4-5 | Added a conditional horizontal-scroll instruction for clipped terminal output. | `mobile demo explains sideways scrolling whenever its terminal clips` · `demo-first-screen-mobile.png` · public live audit confirmed it is visible. |
| F-4-6 | Changed baseline location wording into an instruction rather than an enforced promise. | visitor-copy regression · `landing-mobile.png` · public copy says “Save the baseline in your repository.” |
| F-4-7 | Corrected README demo output wording; it prints a result and workspace path. | visitor-copy regression · `demo-first-screen-mobile.png` · public/browser demo and CLI demo agree. |
| F-4-8 | Scoped CLI-demo isolation to the caller’s project. | visitor-copy regression and `@claim:isolated-demo` · `demo-first-screen-mobile.png` · clean CLI demo writes only a fresh OS-temp workspace. |
| F-4-9 | Replaced unexplained “injection paths” with defined “delivery methods.” | visitor-copy and human-output regressions · `landing-mobile.png` · public and CLI output use the defined phrase. |
| F-4-10 | Completed the preview heading with “before code merges.” | visitor-copy regression · `landing-mobile.png` · public heading is grammatical and specific. |
| F-4-11 | Renamed README “Use” to “Use the CLI.” | visitor-copy regression · `landing-desktop.png` · README heading makes sense out of context. |
| F-5-1 | Removed “Material changes will update the effective date on this page.” and its empty **Changes** section instead of adding an untestable future claim. | `terms state only present, observable policy information`; live verifier Terms assertion · `/work/.evidence/polish5/public-verify-url/screenshot-mobile.png` · cold `/terms/` has no `Changes` heading or future-policy sentence. |

## Final evidence

- Clean clone `/tmp/sid-polish5-clean-9MqRQo/repo` at `939fc1f959def63919bd3188e77903442484e5ff`: `npm ci`, all 21 exact claim commands, `npm test` (9 Rust + 57 Playwright), lint, typecheck, build, audit, and `cargo package --allow-dirty` all passed.
- Public live audit: <https://secret-injection-diff.sociobot.in>; 10 route/viewport Axe scans had zero serious/critical issues, the demo remained storage-free and isolated, and all 15 deployed runtime artifacts matched `dist/site`. Evidence: `/work/.evidence/polish5/public-live/live-audit.json`.
- `verify-url.sh` passed cold. Evidence: `/work/.evidence/polish5/public-verify-url/verify.json`.
- Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; FCP 870 ms, LCP 1,516 ms, TBT 8 ms, CLS 0. Evidence: `/work/.evidence/polish5/lighthouse-public.json`.
