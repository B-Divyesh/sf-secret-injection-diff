# Adversarial first-read review 1 — Secret Injection Diff

- Reviewed: 2026-08-28 UTC
- Live target: <https://secret-injection-diff.sociobot.in>
- Verdict: **FAIL**

The verdict is FAIL because the live site creates browser Cache Storage while its registered privacy claim says the site has no browser data storage. The claim test passes only because it runs on `127.0.0.1`, where `main.js` deliberately does not register the service worker.

## Cold first read

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900, with no scrolling before recording the result.

- **What it does:** compares a saved list of secret-name-to-process relationships with the current configuration and fails a check when a new process receives a secret name.
- **For whom:** developers reviewing CI and deployment changes.
- **What to click first:** **Try it with sample data**.

The first screen answers all three questions. The primary action was visible at 567 px from the top on the 390 px viewport and at 698 px on desktop. This gate passes.

## Findings

### F-1-1 — BLOCKING — live browser storage contradicts the registered privacy claim

- **Quote/location:** `.factory/claims.json`, `site-data-free`: “The site has no analytics, cookies, accounts, forms, or browser data storage”; [Privacy](/work/repo/site/privacy/index.html): “The demo uses bundled text and stores nothing.”
- **Evidence:** in a fresh live browser context, after `/demo/` loaded and `navigator.serviceWorker.ready` resolved, `await caches.keys()` returned `["sid-shell-v2"]`. [sw.js](/work/repo/site/public/sw.js) opens that cache and adds five shell URLs. `localStorage`, `sessionStorage`, IndexedDB, and cookies were empty, but Cache Storage is browser data storage.
- **Why this fails:** a visitor can rely on the claim to decide whether the site writes browser storage. The registered claim test only checks local/session/IndexedDB and runs against `127.0.0.1`; [main.js](/work/repo/site/main.js) excludes that hostname from service-worker registration, so it cannot observe production behaviour.
- **Concrete fix:** because the product makes no offline claim, remove the service worker and assert that `navigator.serviceWorker.getRegistrations()` and `caches.keys()` are empty in the claim test. Alternatively, retain the cache, change the privacy text and claim to say exactly that static shell files are cached locally, and test that bounded behaviour in a production-equivalent host.

### F-1-2 — Minor — the designed 404 route lacks the required route metadata

- **Quote/location:** [404.html](/work/repo/site/404.html) has a title and description but no canonical URL, Open Graph title/description/image, Twitter card metadata, or `apple-touch-icon`.
- **Evidence:** a live inspection of `/404.html` returned `canonical: undefined`, `ogTitle: undefined`, `twitter: undefined`, and `apple: false`; the other four routes provide all of these.
- **Why this fails:** the site-structure contract requires route metadata and icon coverage on every route. Directly shared or bookmarked error pages lose the product identity and produce incomplete previews.
- **Concrete fix:** add the canonical `/404.html`, the same product social-card metadata, Twitter card fields, and the Apple touch icon to `404.html`; add a document-head test for every route.

### F-1-3 — Minor — navigation does not move focus to the destination heading

- **Quote/location:** the demo banner link, [demo/index.html](/work/repo/site/demo/index.html), is “Start for real” and points to `/#install`.
- **Evidence:** activating it by keyboard in a live 390 px browser navigated to `/#install` (`scrollY: 3542`) but left `document.activeElement` as `BODY`; no heading received focus or route announcement occurred.
- **Why this fails:** keyboard and screen-reader users do not receive the required focus handoff on a route change. The visual destination is reached, but assistive technology remains at the document body.
- **Concrete fix:** make the install heading programmatically focusable and focus it after this navigation, with an `aria-live` route/change announcement; cover demo-to-install navigation and browser Back in Playwright.

### F-1-4 — Minor — landing copy uses undefined graph jargon where plain process language is available

- **Quote/location:** landing hero/action, “Watch a new recipient fail the check.”; preview heading, “See the new edge before merge”; method heading, “Review scope in three commands”; limits heading, “Explicit adapters, clear limits.”
- **Why this fails:** a recipient cannot fail a check, and *recipient*, *edge*, *scope*, and *adapter* are not defined before they are used as headings or action explanation. This weakens the otherwise clear first screen, especially for a developer who has not read graph terminology.
- **Concrete fix:** replace these with, respectively: “See the check fail when a new process gets a secret.”; “See which process gets a secret before merge”; “Review secret access in three commands”; and “Supported files and limits.” Define any retained technical term once in the adjacent prose.

### F-1-5 — Minor — the same sensitive concept has inconsistent names

- **Quote/location:** [index.html](/work/repo/site/index.html) says “Read **secret identifiers**”; [README.md](/work/repo/README.md) says “Reports contain **identifiers**”; [privacy/index.html](/work/repo/site/privacy/index.html) says “Reports contain **secret identifiers**”; the headline and brief use “secret names.”
- **Why this fails:** the product’s copy-audit terminology table declares **secret name** as the one term, but visitor-facing copy alternates between names and identifiers. It makes the privacy boundary less immediately legible.
- **Concrete fix:** use “secret name” consistently, for example “Read secret names from supported files” and “Reports contain secret names, process names, source paths, and injection paths.”

### F-1-6 — Minor — README runtime prerequisite is an unlisted claim

- **Quote/location:** [README.md](/work/repo/README.md): “Rust 1.85 or newer is required to build from source.”
- **Why this fails:** this is a dependency/version promise a developer may rely on, but no entry in `.factory/claims.json` names or tests it.
- **Concrete fix:** add a `rust-version` claim with a clean-environment build test that asserts the declared minimum, or remove the version promise and state the supported compiler policy without a number.

### F-1-7 — Minor — README build-output promises are unlisted claims

- **Quote/location:** [README.md](/work/repo/README.md): “The factory can also package the release binary with `cargo build --release`.”, “The site build lands in `dist/site`.”, and “The release CLI lands in `dist/bin`.”
- **Why this fails:** the first command does not itself place a binary in `dist/bin`; that is done by the repository’s `npm run build:cli` wrapper. None of these promises has a `claims.json` entry, so the page asks users to rely on untested build documentation.
- **Concrete fix:** rewrite the first sentence to name `npm run build:cli` (or accurately describe `cargo build --release`), then add one `build-artifacts` claim whose clean-clone test runs the documented build command and asserts both documented paths.

### F-1-8 — Minor — README exit-status promises are only partially covered

- **Quote/location:** [README.md](/work/repo/README.md): “Exit code `0` means no new recipient edge.” and “Other errors use exit code `1`.”
- **Why this fails:** `scope-change` tests only exit code 2 for an addition. The success and error-code promises have no claim entry or tagged observable test.
- **Concrete fix:** add separate `check-no-change-exit-zero` and `invalid-input-exit-one` claims with temporary-directory fixtures, or remove those promises.

## Copy audit

Count method: whitespace-separated words. Commands, nav labels, file labels, and output fragments are included as visitor-facing fragments; code-only commands are marked as such. No audited sentence exceeds 22 words. The jargon and terminology flags are findings F-1-4 and F-1-5.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Secret Injection Diff | 3 | Label |
| Demo | 1 | Label |
| Install | 1 | Label |
| Privacy | 1 | Label |
| Local configuration audit / v0.1.0 | 4 | Fragment |
| Prove which process gets each secret | 6 | Pass |
| For developers reviewing CI and deploy changes before an unexpected process gains a credential. | 14 | Pass |
| Try it with sample data | 6 | Pass |
| Watch a new recipient fail the check. | 7 | Jargon/incorrect actor — F-1-4 |
| Runs locally · no network calls | 5 | Claim listed (`no-network`) |
| Reports names · never values | 4 | Claim listed (`values-excluded`) |
| Free · MIT licensed | 3 | Claim listed (`free-mit`) |
| A cutaway conservatory shows glowing capsules routed into separate plant rooms. | 11 | Alt text passes |
| See the new edge before merge | 7 | Jargon — F-1-4 |
| The check compares the current recipient graph with a committed baseline. | 11 | Jargon — F-1-4 |
| release.yml / recipient diff | 3 | File/output label |
| 1 added, 0 removed | 4 | Output fragment |
| check failed: an undeclared recipient gained a secret name | 9 | Claim listed (`scope-change`) |
| exit 2 | 2 | Claim listed (`scope-change`) |
| Review scope in three commands | 5 | Jargon — F-1-4 |
| The baseline stays in your repository beside the configuration it describes. | 11 | Pass |
| Scan configuration | 2 | Heading |
| Read secret identifiers from supported files and map each recipient. | 10 | Inconsistent term — F-1-5 |
| Commit the baseline | 3 | Heading |
| Review the JSON graph once, then approve it with the pull request. | 12 | Pass |
| Check every change | 3 | Heading |
| Exit code 2 stops CI when a new recipient edge appears. | 11 | Claim listed (`scope-change`) |
| Explicit adapters, clear limits | 4 | Jargon — F-1-4 |
| .env and .env.* | 3 | Supported-file label |
| Docker Compose | 2 | Supported-file label |
| GitHub Actions | 2 | Supported-file label |
| Kubernetes workloads | 2 | Supported-file label |
| What it does not do | 5 | Heading |
| It does not read secret stores. | 6 | Claim listed (`explicit-adapter-limits`) |
| It does not decrypt values. | 5 | Claim listed (`no-decryption-storage`) |
| It does not watch running processes. | 6 | Claim listed (`explicit-adapter-limits`) |
| It does not guess vendor behavior. | 6 | Claim listed (`explicit-adapter-limits`) |
| Install the local CLI | 4 | Heading |
| Copy command | 2 | Result-naming verb |
| Then run secret-injection-diff scan. | 4 | Pass |
| Map secret recipients before merge. | 5 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Secret Injection Diff | 3 | Heading |
| Prove which processes gain secret names before a pull request merges. | 11 | Pass |
| This local CLI is for developers reviewing environment scope across `.env`, Docker Compose, GitHub Actions, and Kubernetes files. | 18 | Pass |
| It records recipient edges, compares them with an approved baseline, and returns exit code `2` when a new edge appears. | 20 | Jargon; exit-2 claim listed |
| The scanner does not decrypt or store secret values. | 9 | Claim listed (`no-decryption-storage`) |
| Reports contain identifiers, recipients, and injection paths. | 7 | Inconsistent term — F-1-5 |
| Use `--redact` before sharing a report. | 6 | Claim listed (`redaction`) |
| Try the isolated demo | 4 | Heading |
| The command copies the shipped sample project into a new temporary directory. | 12 | Claim listed (`isolated-demo`) |
| It compares an approved workflow with a changed workflow and prints where the temporary report lives. | 16 | Claim listed (`isolated-demo`) |
| It never reads or writes project data. | 7 | Claim listed (`isolated-demo`) |
| The browser recording is at `https://secret-injection-diff.sociobot.in/demo`. | 6 | Demo link |
| It uses bundled text and makes no third-party requests. | 9 | Claim listed (`no-network`) |
| Install | 1 | Heading |
| Rust 1.85 or newer is required to build from source. | 10 | Unlisted claim — F-1-6 |
| The factory can also package the release binary with `cargo build --release`. | 12 | Unlisted/inaccurate build claim — F-1-7 |
| Use | 1 | Heading |
| Start by reviewing the discovered edges. | 6 | Pass |
| Approve the current graph. | 4 | Pass |
| Check the graph in CI. | 5 | Pass |
| Exit code `0` means no new recipient edge. | 8 | Unlisted claim — F-1-8 |
| Exit code `2` means at least one undeclared edge appeared. | 10 | Claim listed (`scope-change`) |
| Other errors use exit code `1`. | 6 | Unlisted claim — F-1-8 |
| Use `diff` when you want the same comparison without a failing exit code. | 13 | Pass |
| Supported adapters | 2 | Heading |
| `.env` and `.env.*`: declared uppercase identifiers. | 6 | Supported-adapter detail |
| Values are discarded and never printed. | 6 | Claim listed (`values-excluded`) |
| Docker Compose: `environment`, `env_file`, and service `secrets` entries. | 8 | Supported-adapter detail |
| GitHub Actions: `secrets.NAME` references in job or step `env`, plus reusable workflow secret inheritance. | 14 | Supported-adapter detail |
| Kubernetes: `secretKeyRef`, `envFrom.secretRef`, and mounted secret volumes in Pod templates. | 10 | Supported-adapter detail |
| The CLI does not guess the behavior of Vault, SOPS, Doppler, 1Password, or cloud secret managers. | 16 | Claim listed (`explicit-adapter-limits`) |
| Add an explicit adapter before relying on those sources. | 9 | Pass |
| Develop and verify | 3 | Heading |
| The site build lands in `dist/site`. | 6 | Unlisted claim — F-1-7 |
| The release CLI lands in `dist/bin`. | 6 | Unlisted claim — F-1-7 |
| To work on each half separately: | 6 | Fragment |
| The project has no telemetry, runtime CDN, or paid service. | 10 | Claims listed (`no-network`, `free-mit`) |
| See privacy and terms. | 4 | Link instruction |
| License | 1 | Heading |
| MIT | 1 | License label |

## Demo and sandbox verification

The one-click demo gate passes.

- Selecting **Try it with sample data** from the live landing page reached `/demo/` in one click and immediately showed the realistic `NPM_TOKEN → github:job/verify/step/Publish package` addition and `exit 2`.
- The persistent banner reads “Demo — sample data, nothing is saved” and exposes **Reset demo** and **Start for real**. Reset changed the live status to “Demo reset. Sample data is ready.”
- The recording has no data-entry surface and writes no local/session/IndexedDB state. The exception is F-1-1: the site shell writes Cache Storage, which is not demo data but invalidates the broader declared browser-storage claim.
- `target/debug/secret-injection-diff demo` created `/tmp/secret-injection-diff-demo-3602-1787941349802`, printed the baseline path, and did not write the repository. This matches `.factory/demo.md`.
- Fresh live request logging observed only the product origin. There were no third-party requests, cookies, localStorage, sessionStorage, or IndexedDB records.

## Claims verification

In a separate clean clone at `/tmp/secret-injection-diff-review-clean`, `npm ci` completed successfully and every exact command from `.factory/claims.json` passed with one matching tagged test:

| Claim | Result |
| --- | --- |
| adapters | Pass |
| scope-change | Pass |
| values-excluded | Pass |
| redaction | Pass |
| isolated-demo | Pass |
| json-output | Pass |
| no-network | Pass |
| free-mit | Pass |
| no-decryption-storage | Pass |
| snapshot-only-write | Pass |
| site-data-free | **Test passes, but live claim contradicted — F-1-1** |
| explicit-adapter-limits | Pass |

No test command failed. The claim inventory remains insufficient because it does not cover the unlisted README promises in F-1-6 through F-1-8.

## Earlier-review regression check

There were no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. The earlier verification reports and handoff were read in full.

| Earlier finding | Live/code verification in this round |
| --- | --- |
| Kubernetes false positives/order dependence | Fixed: structural parser regression tests pass; `secretKeyRef` handling is mapping-based. |
| Compose scalar `env_file` and long secret syntax | Fixed: parser regression tests pass. |
| GitHub Actions matrix changed recipient | Fixed: parser regression test passes. |
| Mobile scroll regions, focus contrast, and 44 px targets | Fixed by the 34-test suite, including mobile axe, scroller focus, focus-outline, and target tests. |
| Unlisted privacy claims | Only partially fixed: the entries exist, but `site-data-free` does not test the live service-worker cache and is false in production (F-1-1). |
| Lint/type checks | Fixed: `npm run lint` and `npm run typecheck` pass. |
| Unknown route returned HTTP 200 | Fixed: live `/not-a-route` returns HTTP 404 and renders the designed 404 page. |
| Immutable asset caching | Fixed: live hashed JS returns `cache-control: public, max-age=31536000, immutable`. |

## Structure, accessibility, and route checks

- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` each have one `h1`, one `main`, `lang="en"`, a title, a description, visible header/footer, and no observed console errors.
- `/`, demo, privacy, and terms have the required canonical, Open Graph, Twitter, favicon, and Apple touch icon metadata. `/404.html` does not (F-1-2).
- `robots.txt`, `sitemap.xml`, favicon, and Apple touch icon return 200. The sitemap lists the four indexable routes.
- All crawled links returned 200: local routes, `sociobot.in`, and the project GitHub issues URL.
- `/not-a-route` returns 404. Direct `/demo/` loading works. The focus handoff requirement fails for demo-to-install navigation (F-1-3).
- The product uses the documented conservatory/editorial visual system, not a generic SaaS template. No AI feature is expected for this deterministic local parser; import/export and CI JSON output are present.

## Local verification

The reviewed checkout was clean before documentation changes. These completed successfully:

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

`npm test` reported 8 Rust tests and 34 Playwright tests passing. `npm run build` produced `dist/site` and `dist/bin/secret-injection-diff`.

## What would make this perfect

Remove or accurately disclose and test the service-worker cache; make the 404 document metadata-complete; move keyboard focus and announce the destination after route changes; replace the remaining graph jargon with defined process language; normalize “secret name”; and either test or remove every README runtime/build/exit-status promise. Then re-run this full checklist from a fresh browser context and clean clone with zero findings.
