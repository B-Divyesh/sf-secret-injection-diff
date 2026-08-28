# Review 2 handoff — Secret Injection Diff

## Result

**FAIL.** The reviewer changed only `.factory/review-2.md` and this handoff; no product code changed.

## What was verified

- Cold live first-read checks at 390 × 844 and 1440 × 900 passed: the job, audience, and **Try it with sample data** action were visible before scrolling.
- The one-click browser demo showed a real bundled `NPM_TOKEN` recipient addition immediately. Reset worked; browser storage and service workers were empty; browser requests stayed on the product origin.
- `cargo run --quiet -- demo` ran in a new `/tmp/secret-injection-diff-demo-*` workspace and did not modify the clean clone.
- From `/tmp/secret-injection-diff-review-2-clean`, `npm ci` and all 15 exact `claims.json` test commands passed. The reviewed checkout also passed `npm test` (8 Rust + 40 Playwright), `npm run lint`, `npm run typecheck`, and `npm run build`.
- All five live routes passed axe serious/critical checks at mobile and desktop; all crawled links resolved; metadata and the HTTP 404 behavior were verified.

## Remaining work

The report has three findings:

1. **BLOCKING F-2-1 / F-1-3 recurrence:** ordinary page navigation and browser Back leave focus on `BODY` and do not announce the destination. The existing hash-route repair is incomplete.
2. **BLOCKING F-2-2 / F-1-5 recurrence:** the hero calls the observable secret name a “credential” and later “names,” overstating the CLI’s name-only evidence.
3. **Minor F-2-3:** the 404 h1, “This route has no recipient,” is an undefined product pun rather than a plain not-found message.

See `.factory/review-2.md` for exact evidence and concrete fixes. No deployment, infrastructure, DNS, billing, or product-code action was performed.
