# Independent product verification — FAIL

- Candidate: `782493f2c332ae90e9aa0d673a78ee259335db5e`
- Live URL: `https://secret-injection-diff.sociobot.in`
- Verified: 2026-08-28 UTC
- Work order: `secret-injection-diff-verify-2`
- Verdict: **FAIL — do not release this candidate**

The shipped demo, documented happy path, build, package, privacy posture, and live performance are sound. The candidate is not releasable because ordinary valid Compose, Kubernetes, and GitHub Actions inputs can produce wrong recipient graphs and wrong CI exit codes. Mobile axe also reports serious accessibility violations. The strict claims contract additionally has unlisted claims.

## Release-blocking findings

### High — Kubernetes reports ConfigMaps as secrets and misses reordered secret references

The parser does not verify that a `name`/`key` pair is under `secretKeyRef`, nor that `envFrom.name` is under `secretRef`. A normal ConfigMap-only Deployment produced two fake secret edges:

```text
+ app-config/mode -> kubernetes:deployment/config-only:container/app [env:APP_MODE]
+ shared-config/* -> kubernetes:deployment/config-only:container/app [envFrom:secretRef]
kubernetes-configmap-check-exit=2 (expected 0)
```

YAML mapping order is semantically irrelevant, but putting `key` before `name` under a real `secretKeyRef` produced no edge:

```text
No secret recipient changes.
kubernetes-key-order-check-exit=0 (expected 2)
```

This creates both false CI failures and missed secret-recipient additions in the product's core job.

### High — common valid Compose syntax produces the wrong graph

For scalar `env_file: .env.runtime`, the directory scan found the dotenv declaration but did not connect it to `compose:service/api`. Checking against the env-file-only baseline returned 0 instead of detecting a new recipient:

```text
No secret recipient changes.
compose-scalar-env-file-check-exit=0 (expected 2)
```

For long-form Compose secrets, this valid input:

```yaml
secrets:
  - source: server-certificate
    target: tls.pem
```

was reported as secret identifiers `source` and `target`, not `server-certificate`. This can both miss the real edge and invent nonexistent ones.

### High — a GitHub Actions matrix changes the reported recipient without changing secret scope

The parser treats any nested YAML list item under a job as a workflow step. Adding a normal `strategy.matrix.include` entry before unchanged job-level `env` changed the recipient from `github:job/test` to `github:job/test/step/1`:

```text
+ DATABASE_URL -> github:job/test/step/1 [env:DATABASE_URL]
- DATABASE_URL -> github:job/test [env:DATABASE_URL]
github-matrix-no-scope-change-exit=2 (expected 0)
```

The configuration did not grant a new recipient, but the CLI failed CI.

### High — mobile axe has serious violations

At 390 × 844, axe-core 4.10.2 reported `scrollable-region-focusable`:

- `/`: 2 serious nodes — the terminal `<pre>` and horizontally scrolling install `<code>`.
- `/demo/`: 1 serious node — the terminal `<pre>`.

Desktop scans had zero serious/critical findings, which explains why the existing desktop-only test passed. `.factory/quality.json` says all five routes have zero serious/critical findings without recording this mobile failure.

### High — claim-like privacy statements are absent from `.factory/claims.json`

Each of the eight registered claims has exactly one tagged test and passes. However, the README/privacy page also claim that the CLI does not decrypt or store secrets, writes a baseline only for `snapshot`, has no telemetry, and that the site has no cookies, accounts, forms, or analytics. Those statements have no corresponding claim entries/tests. Under the supplied claims contract, any unlisted claim fails review.

## Other findings

### Medium — focus and touch requirements are not met

- The global acid focus outline is 14.09:1 against the dark background but only **1.04:1** against the paper install panel, below the required 3:1 for the focused copy control.
- On the 390 px layout, header links measured 21.7 px high and footer links about 20.1 px high. They do not meet the 44 × 44 px touch-target requirement.

### Medium — the available strict lint check fails

`cargo fmt --check` and `cargo check --all-targets --all-features` pass. `cargo clippy --all-targets --all-features -- -D warnings` fails with 12 `clippy::collapsible_if` errors in `src/parsers.rs`. No JavaScript lint or type-check script is declared.

### Medium — unknown routes return HTTP 200

`GET /does-not-exist` renders the designed 404 document but returns `200`, not `404`. The same fallback makes `/manifest.webmanifest` appear to exist as HTML. This breaks HTTP-level not-found behavior.

### Low — production cache policy does not match the performance contract

Hashed JS/CSS and image assets all return `cache-control: public, must-revalidate, max-age=30`; they are not long-lived or immutable.

## Required claims gate

`.factory/claims.json` exists with eight entries. Per the requested order, each command was first invoked before dependency installation and reached the browser phase but failed with `ERR_MODULE_NOT_FOUND: @playwright/test`. After the required clean `npm ci`, every exact command passed:

| Claim | Exact command | Result |
| --- | --- | --- |
| `adapters` | `npm test -- --grep @claim:adapters` | Pass, 1 matching test |
| `scope-change` | `npm test -- --grep @claim:scope-change` | Pass, 1 matching test |
| `values-excluded` | `npm test -- --grep @claim:values-excluded` | Pass, 1 matching test |
| `redaction` | `npm test -- --grep @claim:redaction` | Pass, 1 matching test |
| `isolated-demo` | `npm test -- --grep @claim:isolated-demo` | Pass, 1 matching test |
| `json-output` | `npm test -- --grep @claim:json-output` | Pass, 1 matching test |
| `no-network` | `npm test -- --grep @claim:no-network` | Pass, 1 matching test |
| `free-mit` | `npm test -- --grep @claim:free-mit` | Pass, 1 matching test |

The focused adapter claim only asserts that the bundled happy-path output contains four adapter labels. It does not detect the valid-syntax failures above.

## First-read and demo gate

**Pass.** On a cold desktop and 390 px mobile load, the first screen says:

- What it does: “Prove which process gets each secret.”
- For whom: developers reviewing CI and deploy changes.
- What to do first: select “Try it with sample data.”

The primary action is visible within the initial 390 × 844 viewport and opens `/demo/` in one click. The demo immediately shows the added `NPM_TOKEN` recipient and exit 2. Its persistent banner says sample data is not saved and offers **Reset demo** and **Start for real**. Replay/reset work by keyboard. Two CLI demo runs created distinct `/tmp/secret-injection-diff-demo-*` workspaces and left tracked project files unchanged.

## Clean build, tests, and package

An isolated clone at the candidate hash started with zero changed files.

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 21 packages, 0 audit vulnerabilities |
| `npm test` | Pass; 5 Rust tests + 16 Playwright tests |
| `cargo fmt --check` | Pass |
| `cargo check --all-targets --all-features` | Pass |
| `cargo clippy --all-targets --all-features -- -D warnings` | **Fail**, 12 warnings-as-errors |
| `npm audit --audit-level=high` | Pass; 0 vulnerabilities |
| `npm run build` | Pass; `dist/site/` and `dist/bin/secret-injection-diff` produced |
| `cargo package` | Pass; 53 files, 500.5 KiB, 393.9 KiB compressed |
| clean consumer `cargo install --path <unpacked-package> --offline` | Pass |
| installed `secret-injection-diff --version` | Pass; `0.1.0` |
| installed `secret-injection-diff demo --json` | Pass; one `NPM_TOKEN` addition |

The release executable is 807 KiB. `--help` documents commands and exit behavior without interactive prompts.

## End-to-end CLI behavior

The bundled normal path works: `snapshot` writes 10 approved edges, `check` against the changed sample returns 2 with one addition, and `diff` reports the same addition with exit 0. A removal-only check returns 0.

Recovery and boundaries also behave correctly:

- Missing scan path: clear error, exit 1.
- Missing/malformed/unsupported-schema baseline: clear error, exit 1.
- Existing snapshot: refuses overwrite with exit 1; `--force` recovers.
- Empty directory: useful empty state, exit 0.
- File over 5 MiB: skipped with a warning while valid JSON remains on stdout.
- JSON is deterministic and parseable; redaction is stable; sample values do not appear.

## Live site, privacy, security, and performance

- Before the verifier-only documentation commit, `git ls-remote origin refs/heads/main` and local `HEAD` both resolved to the candidate hash. The subsequent push changes only this report and the handoff.
- Local production output and live bytes match for all five HTML files, hashed JS/CSS, three raster assets, favicon, Apple icon, robots, sitemap, and service worker.
- `/opt/fleet/lib/verify-url.sh <url> <evidence-dir>` passes: HTTP 200, title/lang/main/h1/alt checks, zero console errors.
- Desktop and 390 px pages have no document-level horizontal overflow. All five routes have one h1, one main, `lang=en`, titles, and no console/page/request errors.
- Initial browser traffic is same-origin only. No cookies, localStorage, sessionStorage, or IndexedDB data appeared. The service worker creates only its `sid-shell-v1` asset cache.
- Source/dependency inspection found no CLI runtime network client or telemetry path. The site has no analytics or third-party runtime assets.
- HTTPS responses include HSTS, CSP, `nosniff`, Referrer-Policy, Permissions-Policy, and frame blocking through CSP.
- All rendered links across all routes resolve successfully.
- Reduced motion passes: the homepage capsule is hidden, animation duration becomes 0.01 ms, and smooth scrolling is disabled.
- Copy command works and announces success when clipboard permission is available.
- Lighthouse 13.4.1 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.5 s, TBT 15 ms, CLS 0. A reset interaction reached two animation frames in 25.9 ms; Lighthouse had no field INP value.
- Initial transfers: JS 1,002 bytes compressed, CSS 2,807 bytes compressed, mobile hero 40,918 bytes. All size budgets pass.

There are no server-side product endpoints, unlock calls, sign-in, or payment flows. Rate limiting, backend concurrency/persistence, and Entra tenant checks are therefore not applicable. This CLI site is not a PWA (no web app manifest), so PWA install/offline acceptance is not applicable despite its shell service worker. AI adds no useful step to the deterministic local parser, so the missed-leverage check is clear.

## Required remediation before another candidate

1. Parse YAML structurally or make the adapters context- and order-aware; add regression tests for the four core failures above.
2. Run axe at 390 px in CI and make every horizontal scroller keyboard accessible.
3. Add claim entries and observable tests for every retained privacy statement.
4. Fix focus contrast and 44 px targets, make unknown routes return 404, and add immutable caching for hashed assets.
5. Make the declared lint gate pass.
