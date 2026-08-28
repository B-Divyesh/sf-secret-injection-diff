# Perfection-loop round 4 — repair evidence

- Deployed product commits: `584bd90` and `ca25ce3`
- Live URL: <https://secret-injection-diff.sociobot.in>
- Final clean clone: `/tmp/sid-polish4-final-clean-amaVVm/repo` at
  `ca25ce323341460b507edbc145f7a8fe52b960dc`
- Live evidence: `/work/.evidence/polish4/final-live/live-audit.json`
- Screenshots: `/work/.evidence/polish4/final-live/landing-mobile.png`,
  `/work/.evidence/polish4/final-live/demo-first-screen-mobile.png`, and
  `/work/.evidence/polish4/final-live/404-mobile.png`

Every exact command in `claims.json` passed separately from that clean clone.
The live audit opened five routes cold at desktop and mobile, ran Axe on all ten
route/viewport pairs, crawled local links, verified the 404, storage, headers,
focus, reduced motion, and 15 deployed artifact hashes.

## Review 4

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-4-1 | Standalone dotenv entries are `declarations` with no recipient. Only Compose `env_file` creates a process boundary, and comparison ignores declarations. | `@claim:dotenv-capability`; `/work/.evidence/polish4/final-live/landing-mobile.png`; live root passed in `live-audit.json`. |
| F-4-2 | Replaced 32-bit FNV tokens with sorted, per-output opaque `secret_001` labels; all report fields are redacted. | `@claim:redaction` covers 200 unique names; demo screenshot; live privacy route passed. |
| F-4-3 | Added an LD_PRELOAD recorder for socket, connect, send, sendto, sendmsg, and DNS lookup calls around demo, scan, snapshot, diff, and check. | `@claim:no-network`; live demo same-origin request audit; `/demo/?demo=1` passed. |
| F-4-4 | Tightened mobile hero spacing and fact rows so all three facts fit without scrolling. | `all three plain facts finish in the first 390px screen`; `landing-mobile.png`; live bottoms 657/702/747 px. |
| F-4-5 | Added a live, conditional sideways-scroll instruction after each clipped terminal and recalculates it after transcript rendering. | `mobile demo explains sideways scrolling whenever its terminal clips`; `demo-first-screen-mobile.png`; live `/demo/?demo=1` passed. |
| F-4-6 | Rewrote the baseline location statement as an instruction, not an enforced storage promise. | `visitor copy uses the defined product terms and the 404 heading is plain`; `landing-mobile.png`; live `/` passed. |
| F-4-7 | README now says the demo prints the result and temporary workspace path. | visitor-copy regression test; `landing-mobile.png`; live root and README source check passed. |
| F-4-8 | README now limits demo isolation to the caller's project. | visitor-copy regression test; `demo-first-screen-mobile.png`; live `/demo/?demo=1` passed. |
| F-4-9 | Replaced visitor-facing “injection paths” with defined “delivery methods.” | human-output and visitor-copy regressions; `landing-mobile.png`; live root passed. |
| F-4-10 | Completed the preview heading with “before code merges.” | visitor-copy regression; `landing-mobile.png`; live root passed. |
| F-4-11 | Renamed README `Use` to `Use the CLI`. | visitor-copy regression; `landing-mobile.png`; live root passed. |

## Review 3

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | Comparison is keyed only by secret name and process, so delivery-method changes remain approved. | `@claim:same-recipient-injection-change-exit-zero`; demo screenshot; live demo passed. |
| F-3-2 | Compact mobile demo keeps command, change, failure, and exit 2 in the initial viewport. | `mobile demo shows the real command, result, and exit status in its first viewport`; `demo-first-screen-mobile.png`; live `/demo/?demo=1` passed. |
| F-3-3 | Demo banner is sticky with both reset and exit controls visible after scrolling. | `demo banner and sandbox controls stay visible after mobile scrolling`; `demo-bottom-mobile.png`; live demo passed. |
| F-3-4 | Visitor and human output use process, secret name, baseline, and supported files; banned graph terms are absent. | `visitor copy uses the defined product terms and the 404 heading is plain`; `landing-mobile.png`; live root passed. |
| F-3-5 | Secret-name terminology is consistent in the README and pages. | visitor-copy regression; `landing-mobile.png`; live root passed. |
| F-3-6 | `diff` addition behavior is registered and tested. | `@claim:diff-addition-exit-zero`; demo screenshot; live demo passed. |
| F-3-7 | Dotenv behavior is registered, including declaration/process boundary coverage. | `@claim:dotenv-capability`; `landing-mobile.png`; live root passed. |
| F-3-8 | Compose forms are registered and exercised. | `@claim:compose-capability`; `landing-mobile.png`; live root passed. |
| F-3-9 | GitHub Actions job, step, and inheritance forms are registered and exercised. | `@claim:github-actions-capability`; `demo-first-screen-mobile.png`; live demo passed. |
| F-3-10 | Kubernetes secret forms and ConfigMap exclusion are registered and exercised. | `@claim:kubernetes-capability`; `landing-mobile.png`; live root passed. |
| F-3-11 | Replaced “Specimen 02” with “Sample result.” | visitor-copy regression; `landing-mobile.png`; live root passed. |
| F-3-12 | Replaced “Field method” with “How it works.” | visitor-copy regression; `landing-mobile.png`; live root passed. |
| F-3-13 | Replaced “Known terrain” with “Supported files.” | visitor-copy regression; `landing-mobile.png`; live root passed. |
| F-3-14 | Replaced “Outside the fence” with “Limits.” | visitor-copy regression; `landing-mobile.png`; live root passed. |
| F-3-15 | Removed CSS-generated jargon and added a real figure caption. | document-structure and visitor-copy regressions; `landing-mobile.png`; live root passed. |
| F-3-16 | README names the CLI and documentation site explicitly. | visitor-copy regression; `landing-mobile.png`; live root passed. |

## Reviews 1 and 2

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Service worker and cache storage remain absent; privacy text and claim say so exactly. | `@claim:site-data-free`; `demo-first-screen-mobile.png`; live demo storage audit is empty. |
| F-1-2 | 404 has canonical, OG, Twitter, favicon, and Apple touch metadata. | `every route has its exact title, canonical URL, and legal links`; `404-mobile.png`; live `/404.html` passed. |
| F-1-3 | Route, Back, and demo-to-install navigation focus and announce destination headings. | route focus tests; `demo-first-screen-mobile.png`; live demo audit passed. |
| F-1-4 | Removed undefined graph jargon from visitor and human copy. | visitor-copy regression; `landing-mobile.png`; live root passed. |
| F-1-5 | Uses “secret name” consistently. | visitor-copy regression; `landing-mobile.png`; live root passed. |
| F-1-6 | The numeric Rust-version promise remains removed. | visitor-copy regression; `landing-mobile.png`; live root passed. |
| F-1-7 | Build artifact promises are backed by the registered build claim. | `@claim:build-artifacts`; `landing-desktop.png`; live artifact parity passed. |
| F-1-8 | Documented 0, 1, and 2 exits have claim tests. | `@claim:check-no-change-exit-zero`, `@claim:invalid-input-exit-one`, and `@claim:scope-change`; demo screenshot; live demo passed. |
| F-2-1 | Normal navigation and Back hand focus to the destination h1. | `full-page navigation and browser Back focus and announce the destination heading`; `landing-mobile.png`; live root/demo passed. |
| F-2-2 | The site describes secret names, not credentials. | visitor-copy regression; `landing-mobile.png`; live root passed. |
| F-2-3 | The 404 heading is “Page not found.” | visitor-copy regression; `404-mobile.png`; live `/route-that-does-not-exist` returned 404. |

## Final verification

- `npm test`: 9 Rust tests and 56 Playwright tests passed.
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit --audit-level=high`, and `cargo package --allow-dirty`: passed.
- Lighthouse JSON report: performance 100, accessibility 100, best practices 100, SEO 100; FCP 928 ms, LCP 1,536 ms, TBT 23 ms, CLS 0.
- `npm run verify:live -- https://secret-injection-diff.sociobot.in /work/.evidence/polish4/final-live`: passed with zero serious/critical Axe violations and 15 matching artifacts.
- `/opt/fleet/lib/verify-url.sh https://secret-injection-diff.sociobot.in /work/.evidence/polish4/final-live/verify-url`: passed with no console errors.
