# Adversarial review 3 handoff — Secret Injection Diff

## Result

**FAIL.** The complete report is `.factory/review-3.md`. No product code was modified.

The review found three new blocking product/demo defects, reopened two earlier terminology findings as still incomplete, and recorded eleven minor copy/claims findings. The most important defect is a false CI failure: changing only how `API_TOKEN` reaches the same `compose:service/api` recipient returns exit 2 and says a new recipient appeared.

## Verification performed

- Opened the live site cold in fresh Chromium contexts at 390 × 844 and 1440 × 900.
- Exercised the one-click browser demo, replay, reset, storage, request origins, and the CLI demo in a temporary directory.
- Cloned commit `d13343334846887fe4a1056b4509bdb2b46af3de` to `/tmp/secret-injection-diff-review3-clean`, ran `npm ci`, then ran every one of the 15 exact claim commands separately; all passed.
- Ran `npm run lint` and `npm run typecheck`; both passed. The `build-artifacts` claim ran `npm run build` successfully.
- Crawled all rendered links and checked metadata, HTTP 404 behavior, route focus/Back behavior, and mobile/desktop overflow.
- Ran Axe 4.10.2 on home, demo, privacy, terms, and 404 at both viewports after styles loaded; zero serious/critical violations.
- Ran `/opt/fleet/lib/verify-url.sh` against the live root; it passed.
- Read every earlier review, polish report, verification report, and handoff, then checked each earlier finding against live behavior and current code.

## Reproduction for the primary blocker

1. Snapshot a Compose service `api` with `API_TOKEN` under `environment`.
2. Change the same service and same secret name to a Compose service secret mounted as `/run/secrets/token`.
3. Run `secret-injection-diff check` against the baseline.

Observed: exit 2, one addition and one removal, then “an undeclared recipient gained a secret name.” Both edges have recipient `compose:service/api`; only `injection` changed.

## Next steps

Address every finding in `.factory/review-3.md`, especially F-3-1 through F-3-5, add the requested negative-boundary and demo-viewport tests, and repeat the review from a clean clone. The repository remains buildable and only review documentation is changed by this work order.
