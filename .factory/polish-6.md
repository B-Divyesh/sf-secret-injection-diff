# Polish 6 — verified closure

- Base reviewed: `4fd9e42bd93900446fa90e00b23ec380da63fe8e`
- Repair: `166c74823b869555a9b5c1c14856b3f3ca73bd02`
- Published static build: `91a45d95516d4b84f68d3cfafa8655195420ae05`
- Live audit: 2026-08-29T00:22:11Z, cold production contexts at 1440×900 and 390×844.

The following maps every finding from reviews 1–6 to its durable change and
the verification evidence. Screenshot paths are under `.factory/evidence/`
(intentionally ignored from Git); each listed production URL was cold-loaded
by `npm run verify:live` after deployment.

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| F-1-1 | Removed the service worker; the demo remains memory-only with no browser storage. | `@claim:site-data-free`; `live/demo-first-screen-mobile.png`; https://secret-injection-diff.sociobot.in/privacy/ |
| F-1-2 | Completed 404 canonical, OG/Twitter, favicon, and Apple touch metadata. | `/404.html has the required document structure`; `live/404-mobile.png`; https://secret-injection-diff.sociobot.in/404.html |
| F-1-3 | Route changes and Back focus the destination heading and announce it. | `full-page navigation and browser Back focus and announce the destination heading`; `live/demo-first-screen-mobile.png`; https://secret-injection-diff.sociobot.in/demo/?demo=1 |
| F-1-4 | Replaced graph jargon with process and secret-access language. | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/landing-mobile.png`; https://secret-injection-diff.sociobot.in/ |
| F-1-5 | Standardized visitor-facing terminology on “secret name.” | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/landing-desktop.png`; https://secret-injection-diff.sociobot.in/privacy/ |
| F-1-6 | Removed the unproved Rust-version promise. | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/landing-desktop.png`; https://secret-injection-diff.sociobot.in/ |
| F-1-7 | Registered build outputs and moved their build assertion to a serial preflight. | `@claim:build-artifacts`; `live/landing-desktop.png`; https://secret-injection-diff.sociobot.in/ |
| F-1-8 | Registered observable exit-0 and exit-1 claims beside exit-2. | `@claim:check-no-change-exit-zero`, `@claim:invalid-input-exit-one`, `@claim:scope-change`; `live/demo-first-screen-mobile.png`; https://secret-injection-diff.sociobot.in/demo/?demo=1 |
| F-2-1 | Full-document navigation and Back now focus and announce the new h1. | `full-page navigation and browser Back focus and announce the destination heading`; `live/demo-first-screen-mobile.png`; https://secret-injection-diff.sociobot.in/demo/ |
| F-2-2 | The first screen promises only observed secret-name access, not credentials. | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/landing-mobile.png`; https://secret-injection-diff.sociobot.in/ |
| F-2-3 | Replaced the product pun with the plain “Page not found” heading. | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/404-mobile.png`; https://secret-injection-diff.sociobot.in/route-that-does-not-exist |
| F-3-1 | Delivery-method-only changes remain reported but do not fail a check. | `@claim:same-recipient-injection-change-exit-zero`; `live/demo-first-screen-mobile.png`; https://secret-injection-diff.sociobot.in/demo/?demo=1 |
| F-3-2 | The mobile demo shows command, changed process, result, and exit code in its first viewport. | `mobile demo shows the real command, result, and exit status in its first viewport`; `live/demo-first-screen-mobile.png`; https://secret-injection-diff.sociobot.in/demo/?demo=1 |
| F-3-3 | The isolated-demo banner is sticky and keeps Reset and Start for real visible. | `demo banner and sandbox controls stay visible after mobile scrolling`; `live/demo-bottom-mobile.png`; https://secret-injection-diff.sociobot.in/demo/?demo=1 |
| F-3-4 | Removed remaining undefined graph terms from visitor and human CLI copy. | `human CLI output uses process and access language`; `live/landing-mobile.png`; https://secret-injection-diff.sociobot.in/ |
| F-3-5 | README and site use “secret name,” not “identifier.” | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/landing-desktop.png`; https://secret-injection-diff.sociobot.in/ |
| F-3-6 | Registered `diff`’s non-failing addition behavior. | `@claim:diff-addition-exit-zero`; `live/demo-first-screen-mobile.png`; https://secret-injection-diff.sociobot.in/demo/?demo=1 |
| F-3-7 | Registered dotenv declaration/binding behavior. | `@claim:dotenv-capability`; `live/landing-desktop.png`; https://secret-injection-diff.sociobot.in/ |
| F-3-8 | Registered all documented Compose forms. | `@claim:compose-capability`; `live/landing-desktop.png`; https://secret-injection-diff.sociobot.in/ |
| F-3-9 | Registered all documented GitHub Actions forms. | `@claim:github-actions-capability`; `live/demo-first-screen-mobile.png`; https://secret-injection-diff.sociobot.in/demo/?demo=1 |
| F-3-10 | Registered all documented Kubernetes forms and ConfigMap negatives. | `@claim:kubernetes-capability`; `live/landing-desktop.png`; https://secret-injection-diff.sociobot.in/ |
| F-3-11 | Replaced decorative “Specimen 02” with “Sample result.” | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/landing-mobile.png`; https://secret-injection-diff.sociobot.in/ |
| F-3-12 | Replaced “Field method” with “How it works.” | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/landing-desktop.png`; https://secret-injection-diff.sociobot.in/ |
| F-3-13 | Replaced “Known terrain” with “Supported files.” | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/landing-desktop.png`; https://secret-injection-diff.sociobot.in/ |
| F-3-14 | Replaced “Outside the fence” with “Limits.” | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/landing-desktop.png`; https://secret-injection-diff.sociobot.in/ |
| F-3-15 | Replaced CSS-only jargon with a semantic process-mapping caption. | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/landing-mobile.png`; https://secret-injection-diff.sociobot.in/ |
| F-3-16 | Rewrote the README transition to name the CLI and documentation site. | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/landing-desktop.png`; https://secret-injection-diff.sociobot.in/ |
| F-4-1 | Standalone dotenv names are declarations, not process access. | `@claim:dotenv-capability`; `live/landing-mobile.png`; https://secret-injection-diff.sociobot.in/ |
| F-4-2 | `--redact` uses per-output opaque sequential labels. | `@claim:redaction`; `live/demo-first-screen-mobile.png`; https://secret-injection-diff.sociobot.in/demo/?demo=1 |
| F-4-3 | The network claim records real CLI syscall attempts and browser origins. | `@claim:no-network`; `live/demo-first-screen-mobile.png`; https://secret-injection-diff.sociobot.in/privacy/ |
| F-4-4 | All three first-screen facts finish above the 844 px mobile fold. | `all three plain facts finish in the first 390px screen`; `live/landing-mobile.png`; https://secret-injection-diff.sociobot.in/ |
| F-4-5 | A visible instruction appears whenever terminal output clips horizontally. | `mobile demo explains sideways scrolling whenever its terminal clips`; `live/demo-first-screen-mobile.png`; https://secret-injection-diff.sociobot.in/demo/?demo=1 |
| F-4-6 | Baseline location is now an instruction, not an unenforced promise. | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/landing-mobile.png`; https://secret-injection-diff.sociobot.in/ |
| F-4-7 | README accurately describes the result and workspace path, not a report file. | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/demo-first-screen-mobile.png`; https://secret-injection-diff.sociobot.in/demo/?demo=1 |
| F-4-8 | Demo isolation is scoped to the caller’s project and backed by an OS-temp workspace test. | `@claim:isolated-demo`; `live/demo-first-screen-mobile.png`; https://secret-injection-diff.sociobot.in/demo/?demo=1 |
| F-4-9 | Replaced undefined “injection paths” with defined “delivery methods.” | `human CLI output uses process and access language`; `live/landing-desktop.png`; https://secret-injection-diff.sociobot.in/ |
| F-4-10 | Completed the preview heading with “before code merges.” | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/landing-mobile.png`; https://secret-injection-diff.sociobot.in/ |
| F-4-11 | Renamed README “Use” to “Use the CLI.” | `visitor copy uses the defined product terms and the 404 heading is plain`; `live/landing-desktop.png`; https://secret-injection-diff.sociobot.in/ |
| F-5-1 | Removed the untestable future Terms-change promise and empty Changes section. | `terms state only present, observable policy information`; `live/landing-desktop.png`; https://secret-injection-diff.sociobot.in/terms/ |
| F-6-1 | Build artifacts are produced by `test:build-artifacts` before Playwright starts; browser workers only observe them. Added `test:repeat`, which runs the complete two-worker suite three times serially. | `browser tests do not rebuild the preview output`, `npm run test:repeat` (3 × 58 pass); `verify-url/screenshot-desktop.png`; https://secret-injection-diff.sociobot.in/ |

## Final production evidence

- `npm run verify:live` found zero serious/critical Axe violations across ten
  cold route/viewport checks; no console errors; no browser storage; and 15/15
  deployed artifacts byte-matched `dist/site`.
- `/opt/fleet/lib/verify-url.sh` passed at the live root with title, language,
  one h1, main landmark, image alternatives, and zero console errors.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.8 s, LCP 1.5 s, TBT 0 ms, CLS 0. Evidence:
  `.factory/evidence/polish-6/lighthouse.json`.
