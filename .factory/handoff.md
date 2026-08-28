# Adversarial review 4 handoff — Secret Injection Diff

## Result

**FAIL.** Review 4 is recorded in `.factory/review-4.md` with three blocking and eight minor findings. Product code was not modified.

## What was done

- Captured cold live first screens at 390 × 844 and 1440 × 900 before scrolling.
- Audited every landing-page and README prose item, heading, label, action, and meaningful output fragment with word counts.
- Exercised the one-click browser demo, Reset, replay, sticky banner, Start for real, Back, focus announcements, storage isolation, and request privacy.
- Ran the CLI demo from an empty temporary caller directory.
- Created `/tmp/sid-review4-clean`, installed dependencies, and ran all 21 exact commands from `.factory/claims.json` separately.
- Rechecked every finding from reviews 1–3 against the live site and current code.
- Crawled deployed links and routes; checked titles, metadata, 404 behavior, accessibility, reduced motion, and local/live artifact parity.

## Verification

- `npm test`: pass; 9 Rust tests and 54 Playwright tests.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm run build`: pass; `dist/site` and `dist/bin/secret-injection-diff` produced.
- All 21 registered claim commands: pass from `/tmp/sid-review4-clean`.
- `npm run verify:live -- https://secret-injection-diff.sociobot.in /tmp/sid-review4-live`: pass; 10 route audits, zero serious Axe findings, no browser storage, 15/15 artifacts matched.
- `/opt/fleet/lib/verify-url.sh https://secret-injection-diff.sociobot.in /tmp/sid-review4-verify-url`: pass.

## Findings left for repair

- Blocking: standalone `.env` files are emitted as process recipients; deterministic 32-bit redaction permits dictionary recovery; the CLI no-network claim test does not observe runtime traffic.
- Minor: two required mobile facts are below the first fold; clipped demo output lacks the design-required scroll instruction; one baseline-location claim is unlisted and unenforced; two README demo sentences are inaccurate or overbroad; “injection paths” is undefined; one landing heading is grammatically incomplete; and the README “Use” heading is vague.

The next worker should repair each item by ID, add the specified negative/observable tests, and rerun the entire review rather than only the changed areas.
