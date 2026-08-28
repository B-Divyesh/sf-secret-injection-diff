# Perfection-loop polish 2 — finding closure

- Candidate repaired: `14eb86fe9ae752267f44da6f91d6baa3e6fd1d85`
- Cumulative review repaired: `review-1.md` and `review-2.md` at `49bcc4ee6272e32f5040bd7ffbd814f368ed8f50`
- Repair commit: `d67773d971ba810659d10490bbffcf325f8cd585`
- Live URL: <https://secret-injection-diff.sociobot.in>
- Cold live recheck: 2026-08-28 UTC

All findings, including the earlier items that review 2 found only partly fixed, are closed.

| Finding | Change made | Evidence | Screenshot / live check |
| --- | --- | --- | --- |
| F-1-1 | The service worker remains removed; the privacy claim continues to assert no browser storage. | Clean-clone `@claim:site-data-free` | `.factory/evidence/polish-2/live-routes/live-interactions.json`: zero caches/service workers/storage; live `/demo/?demo=1` only requested the product origin. |
| F-1-2 | The designed 404 keeps canonical, OG/Twitter, favicon, and Apple icon metadata. | `/404.html has the required document structure` | `.factory/evidence/polish-2/live-routes/404-mobile.png`; <https://secret-injection-diff.sociobot.in/404.html> has the route metadata. |
| F-1-3 | Full-page `pageshow` now focuses and announces the destination `<h1>`; hash navigation retains section focus. | `full-page navigation and browser Back focus and announce the destination heading`; `demo-to-install navigation moves focus, announces the section, and Back restores the demo` | `.factory/evidence/polish-2/live-routes/live-interactions.json`: live Home → Demo and Back both focus and announce the correct heading. |
| F-1-4 | The landing continues to use process language for the check, review, and supported-file sections. | `landing copy uses secret name consistently and the 404 heading is plain` | `.factory/evidence/polish-2/live-root/screenshot-mobile.png`; <https://secret-injection-diff.sociobot.in/>. |
| F-1-5 | Replaced the remaining hero ambiguity with **secret name**, including the headline, lede, fact, preview, demo wording, and footer. | `landing copy uses secret name consistently and the 404 heading is plain` | `.factory/evidence/polish-2/live-root/screenshot-mobile.png`; live root headline is “Prove which process gets each secret name.” |
| F-1-6 | The unsupported numeric Rust-version promise remains absent from README. | Clean-clone claim inventory plus `npm test` | README on pushed `main` has no compiler-version promise. |
| F-1-7 | The documented `npm run build` output contract remains registered and tested. | Clean-clone `@claim:build-artifacts` | `dist/site/index.html` and `dist/bin/secret-injection-diff` were produced by `npm run build`. |
| F-1-8 | Exit 0, 1, and 2 behavior remains separately claimed and tested. | Clean-clone `@claim:check-no-change-exit-zero`, `@claim:invalid-input-exit-one`, `@claim:scope-change` | The live demo still displays the real exit-2 sample. |
| F-2-1 | Added normal-route and Back/Forward focus handoff with a polite heading announcement on every page show. | `full-page navigation and browser Back focus and announce the destination heading` | `.factory/evidence/polish-2/live-routes/live-interactions.json`; <https://secret-injection-diff.sociobot.in/demo/>. |
| F-2-2 | Rewrote first-screen copy from “credential” and bare “names” to the observable **secret name**. | `landing copy uses secret name consistently and the 404 heading is plain` | `.factory/evidence/polish-2/live-root/screenshot-mobile.png`; <https://secret-injection-diff.sociobot.in/>. |
| F-2-3 | Replaced the 404 pun with the plain heading “Page not found.” | `landing copy uses secret name consistently and the 404 heading is plain` | `.factory/evidence/polish-2/live-routes/404-mobile.png`; <https://secret-injection-diff.sociobot.in/does-not-exist> returns HTTP 404 with that heading. |

## Cumulative verification

- A fresh clone at `/tmp/sid-polish2-clean-jpcy9V` ran `npm ci` and every exact command declared in `.factory/claims.json`; all 15 selected exactly one passing `@claim:<id>` test.
- Current checkout: `npm test` passed 8 Rust and 42 Playwright tests; `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit --audit-level=high`, and `cargo package --allow-dirty` passed.
- Live route audit at 390 × 844 found zero axe serious/critical violations, zero horizontal overflow, one `main`, one `h1`, correct titles, and no console errors on `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/404.html`. Evidence: `.factory/evidence/polish-2/live-routes/live-routes.json`.
- `/opt/fleet/lib/verify-url.sh` passed cold at the live root. Evidence: `.factory/evidence/polish-2/live-root/verify.json`.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 812 ms, LCP 1,507 ms, TBT 1 ms, CLS 0. Evidence: `.factory/evidence/polish-2/lighthouse-live.json`.
