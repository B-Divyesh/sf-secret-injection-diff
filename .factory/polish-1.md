# Perfection-loop polish 1 — finding closure

- Candidate repaired: `54e16879752318518e22279a12eb4db739740827`
- Review repaired: `0c7923771d7d2afda52d08c0ee947b03ddbc8ae4`
- Repair commit: `9cf68ab0f7ffad50a4a582ec5375c8d52ae1d881`
- Live URL: <https://secret-injection-diff.sociobot.in>
- Live deployment checked cold: 2026-08-28 UTC

Every finding in `review-1.md` is closed. No earlier `review-*.md` or `polish-*.md` existed. The earlier `verification-2.md` regressions remain covered and pass.

| Finding | Change made | Test evidence | Screenshot path | Cold live URL check |
| --- | --- | --- | --- | --- |
| F-1-1 | Removed service-worker registration and `sw.js`. Strengthened the privacy claim to assert zero registrations and Cache Storage entries. | `@claim:site-data-free`; full `npm test` | `.factory/evidence/polish-1/live-demo-mobile.png` | Fresh context across all routes: `serviceWorkers: 0`, `caches: []`, all other storage empty, only product-origin requests; `/sw.js` returns 404. |
| F-1-2 | Added canonical, Open Graph, Twitter card, social image, favicon, and Apple touch icon metadata to the designed 404 document. Added head assertions for all five routes. | `/404.html has the required document structure` | `.factory/evidence/polish-1/404-mobile.png` | <https://secret-injection-diff.sociobot.in/404.html> reports the canonical URL, OG title, large-image card, and Apple icon; unknown routes return HTTP 404. |
| F-1-3 | Made the install heading focusable. Hash navigation focuses it and announces the destination in a polite status region. Browser Back returns to the demo URL. | `demo-to-install navigation moves focus, announces the section, and Back restores the demo` | `.factory/evidence/polish-1/live-demo-mobile.png` | From <https://secret-injection-diff.sociobot.in/demo/?demo=1>, Start for real produced `activeElement.id=install-heading` and “Install the local CLI section.” |
| F-1-4 | Rewrote the action explanation and section headings in process language. Users now review secret access and supported files. | `landing page fits a 390px viewport`; `.factory/copy-audit.md` | `.factory/evidence/polish-1/live-landing-mobile.png` | <https://secret-injection-diff.sociobot.in/> shows the revised text; the CTA begins at y=567 and fits the first 844 px screen. |
| F-1-5 | Replaced visitor-facing “secret identifiers” with “secret names” and used “process names” where the privacy boundary is explained. | `@claim:values-excluded`; copy audit | `.factory/evidence/polish-1/live-landing-mobile.png` | Landing and <https://secret-injection-diff.sociobot.in/privacy/> consistently use “secret name” for the sensitive label. |
| F-1-6 | Removed the unsupported numeric Rust-minimum promise from README instead of retaining an unproved compatibility claim. | Clean-clone claim inventory: 15 listed claims and 15 independently passing commands | `.factory/evidence/polish-1/verify-live/screenshot-desktop.png` | The pushed README on `main` contains no Rust-version promise; live product behavior is unchanged. |
| F-1-7 | Replaced the inaccurate packaging sentence with `npm run build`, documented both output paths, and registered an observable build claim. | `@claim:build-artifacts` | `.factory/evidence/polish-1/verify-live/screenshot-desktop.png` | Deployed files came from `dist/site`; live root and runtime assets return 200. |
| F-1-8 | Registered and tested success and invalid-input exit behavior alongside the existing exit-2 claim. Reworded README in process language. | `@claim:check-no-change-exit-zero`, `@claim:invalid-input-exit-one`, `@claim:scope-change` | `.factory/evidence/polish-1/demo-desktop.png` | <https://secret-injection-diff.sociobot.in/demo/?demo=1> shows exit 2; clean-clone CLI tests prove exit 0 and exit 1. |

## Additional acceptance evidence

- The landing action links to `/demo/?demo=1`; `/?demo=1` also enters that isolated sample route directly.
- Demo reset restores the bundled transcript and announces “Demo reset. Sample data is ready.” Nothing is persisted.
- All five routes passed axe at 390×844 and 1440×900 with zero serious or critical violations.
- All crawled links on all routes returned HTTP 200. `/not-a-route` and `/sw.js` returned HTTP 404.
- `verify-url.sh` passed against the live root with one h1, one main, `lang=en`, complete alt text, and zero console errors. Evidence: `.factory/evidence/polish-1/verify-live/verify.json`.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 851 ms, LCP 1,566 ms, TBT 0 ms, CLS 0. Evidence: `.factory/evidence/polish-1/lighthouse-live.json`.
- Transfer budgets: JS 1,286 bytes gzip, CSS 2,812 bytes gzip, mobile hero 40,918 bytes, desktop hero 132,680 bytes, no font downloads.
