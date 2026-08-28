# Adversarial first-read review 5 — Secret Injection Diff

- Reviewed: 2026-08-28 UTC
- Live target: <https://secret-injection-diff.sociobot.in>
- Candidate: `8024b91b85d081163192528a99e6c9dd78596264`
- Viewports: fresh Chromium contexts at 390 × 844 and 1440 × 900
- Verdict: **FAIL**

The job, audience, and first action are clear before scrolling; the demos are immediate and isolated; all 21 registered claim commands pass; and every earlier finding remains fixed. The verdict is nevertheless FAIL because the Terms page contains one unlisted, untestable future policy claim. PASS requires zero findings.

## Cold first read

I opened the live root in separate fresh mobile and desktop contexts and recorded these answers at `scrollY = 0` before inspecting the repository or scrolling.

| Question | Answer in my own words | Exact first-screen evidence |
| --- | --- | --- |
| What does this do? | It checks configuration to show which process gets each secret name. | “Check which process gets each secret name” |
| For whom? | Developers reviewing CI and deployment changes. | “For developers reviewing CI and deploy changes before a new process gets a secret name.” |
| What should I click first? | **Try it with sample data**. | The primary action is visible in the initial viewport at both sizes; its adjacent text says what the demo will show. |

The mobile first screen also contains all three required facts. Their bottom edges were 657.13, 702.13, and 747.13 px in the 844 px viewport. No console error, layout overflow, or missing first-screen answer was observed.

## Findings

### F-5-1 — Minor — the Terms page makes an unlisted future policy claim

- **Exact quote/location:** live `/terms/`, Changes: “Material changes will update the effective date on this page.”
- **Why this fails:** a visitor can rely on the displayed effective date to decide whether the terms changed, but `.factory/claims.json` has no entry or test for this promise. A clean build can confirm today’s date, but it cannot prove what a future material change will do. The claims contract requires removal of a claim that the sandbox cannot test.
- **Concrete fix:** delete this sentence and the now-empty **Changes** section. Keep the current effective date as page metadata. Do not replace it with another future promise unless an enforceable release check can prove the behavior.

## Copy audit

Count method: whitespace-separated words. Raw commands in fenced code blocks are not sentences and are excluded; their lead-in sentences, headings, labels, buttons, feedback, alt text, and meaningful output fragments are included. No sentence exceeds 22 words, no banned marketing adjective appears, terminology is consistent, headings name their sections, and every button uses a result-naming verb. There are no copy findings.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Clear action |
| Secret Injection Diff | 3 | Product label |
| Demo; Install; Privacy | 1 each | Navigation labels |
| Local configuration audit / v0.1.0 | 5 | Useful context label |
| Check which process gets each secret name | 7 | Plain job headline |
| For developers reviewing CI and deploy changes before a new process gets a secret name. | 14 | Plain audience/situation sentence |
| Try it with sample data | 6 | Result-naming action |
| See the check fail when a new process gets a secret name. | 12 | Explains the action result |
| Runs locally · no network calls | 6 | Listed claim `no-network` |
| Reports secret names · never values | 6 | Listed claim `values-excluded` |
| Free · MIT licensed | 4 | Listed claim `free-mit` |
| A cutaway conservatory shows glowing capsules routed into separate plant rooms. | 11 | Useful image alternative |
| Secret names mapped to processes | 5 | Informative figure caption |
| Sample result | 2 | Section label |
| See which process gets a secret name before code merges | 10 | Informative heading |
| The check compares current secret access with a committed baseline. | 10 | Listed claim `scope-change` |
| release.yml / process access | 4 | Output label |
| 1 process added, 0 removed; 0 delivery methods changed | 9 | Sample output |
| check failed: an unapproved process gained a secret name | 9 | Listed claim `scope-change` |
| exit 2 | 2 | Listed claim `scope-change` |
| How it works | 3 | Section label |
| Review secret access in three commands | 6 | Informative heading |
| Save the baseline in your repository beside the configuration it describes. | 11 | Instruction, not a storage promise |
| Scan configuration | 2 | Step heading |
| Read secret names from supported files. | 7 | Listed adapter claims |
| List processes only when a supported file names them. | 9 | Listed `dotenv-capability` boundary |
| Commit the baseline | 3 | Step heading |
| Review the JSON list once, then approve it with the pull request. | 12 | Concrete instruction |
| Check every change | 3 | Step heading |
| Exit code 2 stops CI when a new process gets a secret name. | 13 | Listed claim `scope-change` |
| Supported files | 2 | Section label |
| Supported files and limits | 4 | Informative heading |
| .env and .env.*; Docker Compose; GitHub Actions; Kubernetes workloads | 3; 2; 2; 2 | File-type labels |
| Limits | 1 | Section label |
| What it does not do | 5 | Informative heading |
| It does not read secret stores. | 6 | Listed claim `explicit-adapter-limits` |
| It does not decrypt values. | 5 | Listed claim `no-decryption-storage` |
| It does not watch running processes. | 6 | Listed claim `explicit-adapter-limits` |
| It does not guess vendor behavior. | 6 | Listed claim `explicit-adapter-limits` |
| Start with your repository | 4 | Section context |
| Install the local CLI | 4 | Informative heading |
| Copy command | 2 | Result-naming button |
| Install command copied. | 3 | Clear success feedback |
| Copy failed. | 2 | Clear error |
| Select the command and copy it. | 6 | Recovery action |
| Then run secret-injection-diff scan. | 4 | Concrete next step |
| Scroll sideways to read the full command and process path. | 10 | Responsive-use instruction |
| Map secret names to processes before code merges. | 8 | Product footer summary |
| v0.1.0 · build 2026-08-28 | 4 | Build label |
| Terms | 1 | Navigation label |
| Built by Param Factory (external) | 5 | Attribution with destination type |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Secret Injection Diff | 3 | Product heading |
| Prove which processes gain secret names before a pull request merges. | 11 | Plain job statement |
| This local CLI is for developers reviewing secret access across `.env`, Docker Compose, GitHub Actions, and Kubernetes files. | 18 | Listed adapter claims |
| It records which named processes get secret names and compares them with an approved baseline. | 15 | Listed claims `adapters` and `scope-change` |
| It returns exit code `2` when a new process gets a secret name. | 13 | Listed claim `scope-change` |
| The scanner does not decrypt or store secret values. | 9 | Listed claim `no-decryption-storage` |
| Reports contain secret names, process names, and delivery methods, such as an environment variable or mounted file. | 17 | Listed claim `json-output` |
| Use `--redact` before sharing a report. | 6 | Listed claim `redaction` |
| It uses opaque labels that match only within that output. | 10 | Listed claim `redaction` |
| Try the isolated demo | 4 | Informative heading |
| The command copies the shipped sample project into a new temporary directory. | 12 | Listed claim `isolated-demo` |
| It compares an approved workflow with a changed workflow, prints the result, and shows the temporary workspace path. | 18 | Listed claim `isolated-demo` |
| It does not read or write the project where you run the command. | 13 | Listed claim `isolated-demo` |
| The browser recording is at `https://secret-injection-diff.sociobot.in/demo/?demo=1`. | 6 | Working demo link |
| It uses bundled text and makes no third-party requests. | 9 | Listed claim `no-network` |
| Install | 1 | Informative heading |
| Run `npm run build` to package the release binary and build the documentation site. | 13 | Listed claim `build-artifacts` |
| Use the CLI | 3 | Informative heading |
| List which processes get each secret name: | 7 | Concrete instruction |
| Save the current list as the approved baseline: | 8 | Concrete instruction |
| Check current access against the baseline in CI: | 8 | Concrete instruction |
| Exit code `0` means no process gained a secret name. | 10 | Listed claim `check-no-change-exit-zero` |
| Exit code `2` means at least one new process gained a secret name. | 13 | Listed claim `scope-change` |
| Invalid input uses exit code `1`. | 6 | Listed claim `invalid-input-exit-one` |
| Changing only the delivery method for the same secret name and process is reported, but the check still returns exit code `0`. | 22 | Listed claim `same-recipient-injection-change-exit-zero`; at the hard cap |
| Use `diff` when you want the same comparison without a failing exit code. | 13 | Listed claim `diff-addition-exit-zero` |
| Supported files | 2 | Informative heading |
| `.env` and `.env.*`: declared uppercase secret names. | 7 | Listed claim `dotenv-capability` |
| They do not count as process access until a Compose `env_file` entry binds them. | 14 | Listed claim `dotenv-capability` |
| Values are discarded and never printed. | 6 | Listed claim `values-excluded` |
| Docker Compose: `environment`, `env_file`, and service `secrets` entries. | 8 | Listed claim `compose-capability` |
| GitHub Actions: `secrets.NAME` references in job or step `env`, plus reusable workflow secret inheritance. | 14 | Listed claim `github-actions-capability` |
| Kubernetes: `secretKeyRef`, `envFrom.secretRef`, and mounted secret volumes in Pod templates. | 10 | Listed claim `kubernetes-capability` |
| The CLI does not guess the behavior of Vault, SOPS, Doppler, 1Password, or cloud secret managers. | 16 | Listed claim `explicit-adapter-limits` |
| Add support for those sources before relying on them. | 9 | Concrete limitation instruction |
| Develop and verify | 3 | Informative heading |
| The site build lands in `dist/site`. | 6 | Listed claim `build-artifacts` |
| The release CLI lands in `dist/bin`. | 6 | Listed claim `build-artifacts` |
| Deploy the contents of `dist/site` to a static host. | 9 | Concrete instruction |
| The factory handles production deployment; this repository does not manage infrastructure. | 11 | Clear repository scope |
| Build and test the CLI and documentation site separately: | 9 | Concrete instruction |
| The project has no telemetry or paid service. | 8 | Listed claims `no-network` and `free-mit` |
| The website loads no files from another domain. | 8 | Listed claim `no-network` |
| See privacy and terms. | 4 | Clear link instruction |
| License | 1 | Informative heading |
| MIT | 1 | Listed claim `free-mit` |

Terminology is stable: **secret name**, **process**, **declaration**, **delivery method**, **baseline**, **file type**, and **demo** each have one meaning. No jargon, metaphor heading, empty slogan, inconsistent term, or non-result button requires a rewrite.

## Demo and sandbox verification

- One click on **Try it with sample data** opened `/demo/?demo=1`.
- The initial 390 × 844 demo viewport already showed the real command, the `NPM_TOKEN` process addition, the count, failure text, and `exit 2`. The terminal starts at 615.78 px and its final line ends at 722.16 px.
- The sticky banner says “Demo — sample data, nothing is saved” and keeps **Reset demo** and **Start for real** visible after scrolling. **Reset demo** restored the transcript and announced “Demo reset. Sample data is ready.”
- The visible sideways-scroll instruction appears because the terminal is wider than the phone viewport.
- A pre-existing `localStorage` value `real:review-5-marker=keep` remained unchanged after demo entry and reset. The demo added no local/session/IndexedDB/Cache Storage, cookie, or service-worker state.
- The full request log contained only `https://secret-injection-diff.sociobot.in`. The product makes no offline claim.
- From a separate temporary caller directory, the clean-clone binary created `/tmp/secret-injection-diff-demo-6349-1787957803753`; it left the caller’s only sentinel file byte-identical and created no caller-project file.

The one-click demo and isolation gates pass.

## Claims verification

A clean clone at `/tmp/sid-review5-clean-4rZYrq/repo`, commit `8024b91b85d081163192528a99e6c9dd78596264`, received a fresh `npm ci`. Every exact command in `.factory/claims.json` was then run separately. Each command selected exactly one matching tagged test and passed.

| Claim | Result | Evidence checked |
| --- | --- | --- |
| `adapters` | Pass | Bundled JSON contains all four documented file types. |
| `dotenv-capability` | Pass | Standalone names are declarations; Compose binding creates process access. |
| `compose-capability` | Pass | Environment, scalar/list `env_file`, and short/long secrets pass. |
| `github-actions-capability` | Pass | Job env, step env, and reusable-workflow inheritance pass. |
| `kubernetes-capability` | Pass | Three secret forms pass; ConfigMaps remain excluded. |
| `scope-change` | Pass | A new process exits 2; a delivery-only refactor does not. |
| `same-recipient-injection-change-exit-zero` | Pass | Same process/name with a new delivery method exits 0. |
| `check-no-change-exit-zero` | Pass | An unchanged project exits 0. |
| `diff-addition-exit-zero` | Pass | An addition is printed and `diff` exits 0. |
| `invalid-input-exit-one` | Pass | Missing input gives an actionable error and exits 1. |
| `values-excluded` | Pass | Fixture values are absent while names remain. |
| `redaction` | Pass | Numbered labels replace every name; 200 names remain unique. |
| `isolated-demo` | Pass | A fresh OS-temp workspace is used and shipped samples stay unchanged. |
| `json-output` | Pass | Schema 1 JSON includes observable access fields. |
| `no-network` | Pass | Demo, scan, snapshot, diff, and check produce no recorded socket/connect/send/DNS activity; browser traffic is same-origin. |
| `free-mit` | Pass | The MIT license ships and no payment path exists. |
| `no-decryption-storage` | Pass | Sentinel values are absent; input and directory contents remain unchanged. |
| `snapshot-only-write` | Pass | Only explicit `snapshot` creates the requested baseline. |
| `site-data-free` | Pass | Five routes create no service worker, cache, cookie, browser storage, form, account, analytics, or third-party request. |
| `build-artifacts` | Pass | `npm run build` creates non-empty site and CLI outputs. |
| `explicit-adapter-limits` | Pass | Vault/SOPS-style inputs create no access; no vendor or process watcher exists. |

The live landing, demo, privacy, terms, and README were cross-checked against the registry. Every registered claim has a passing observable test. F-5-1 is the one claim-like sentence missing from the registry and is not testable as written.

## Earlier findings rechecked

Every earlier `review-*.md`, `polish-*.md`, verification report, and handoff was read. Each finding was checked against the live site and current code.

### Review 1

| Finding | Current confirmation |
| --- | --- |
| F-1-1 browser storage contradiction | Fixed: live storage, Cache Storage, and service-worker registrations are empty; `/sw.js` is absent. |
| F-1-2 incomplete 404 metadata | Fixed: canonical, OG/Twitter, favicon, and Apple icon are present. |
| F-1-3 route focus | Fixed: Demo, Back, and demo-to-install focus and announce the destination heading. |
| F-1-4 graph jargon | Fixed: visitor and human CLI copy use process/access language. |
| F-1-5 inconsistent secret terminology | Fixed: visitor copy consistently uses “secret name.” |
| F-1-6 untested Rust version | Fixed: no numeric minimum promise exists. |
| F-1-7 build-output promises | Fixed: `build-artifacts` passes and both documented outputs exist. |
| F-1-8 partial exit-code coverage | Fixed: exit 0, 1, and 2 each have passing observable claims. |

### Review 2

| Finding | Current confirmation |
| --- | --- |
| F-2-1 normal route/Back focus | Fixed live and in route tests. |
| F-2-2 credential overclaim | Fixed: the hero promises only observable secret-name access. |
| F-2-3 metaphorical 404 heading | Fixed: the heading is “Page not found.” |

### Review 3

| Finding | Current confirmation |
| --- | --- |
| F-3-1 delivery-method false failure | Fixed: the exact same-process refactor exits 0 and is reported separately. |
| F-3-2 demo output below mobile fold | Fixed: the final output line ends at 722.16 px. |
| F-3-3 nonpersistent demo banner | Fixed: the sticky banner remains at 0–80.14 px after bottom scroll. |
| F-3-4 undefined graph terms | Fixed: rejected visitor/human-output terms remain absent. |
| F-3-5 README “identifiers” | Fixed: README says “secret names.” |
| F-3-6 unlisted `diff` exit behavior | Fixed: `diff-addition-exit-zero` passes. |
| F-3-7 dotenv detail | Fixed: the detailed claim passes, including declaration-only behavior. |
| F-3-8 Compose detail | Fixed: all documented forms pass. |
| F-3-9 GitHub Actions detail | Fixed: all documented forms pass. |
| F-3-10 Kubernetes detail | Fixed: all documented forms and ConfigMap negatives pass. |
| F-3-11 “Specimen 02” | Fixed: replaced by “Sample result.” |
| F-3-12 “Field method” | Fixed: replaced by “How it works.” |
| F-3-13 “Known terrain” | Fixed: replaced by “Supported files.” |
| F-3-14 “Outside the fence” | Fixed: replaced by “Limits.” |
| F-3-15 CSS-generated jargon | Fixed: a semantic figure caption names the relationship. |
| F-3-16 vague README transition | Fixed: it explicitly names the CLI and documentation site. |

### Review 4

| Finding | Current confirmation |
| --- | --- |
| F-4-1 dotenv files reported as processes | Fixed: standalone entries are declarations and comparison ignores them until bound. |
| F-4-2 reversible redaction | Fixed: per-output numbered labels replace names; the 200-name test finds no collision or raw name. |
| F-4-3 unobserved CLI network claim | Fixed: the passing claim records socket, connect, send, and DNS calls around every command. |
| F-4-4 mobile facts below fold | Fixed: all three end above 748 px. |
| F-4-5 hidden horizontal-scroll requirement | Fixed: a conditional visible instruction appears with clipped output. |
| F-4-6 baseline-location overclaim | Fixed: the text is an instruction to save it in the repository. |
| F-4-7 nonexistent demo report file | Fixed: README accurately says result and workspace path. |
| F-4-8 overbroad isolation sentence | Fixed: README names the caller’s project boundary. |
| F-4-9 undefined “injection paths” | Fixed: visitor and human output say “delivery methods.” |
| F-4-10 incomplete “before merge” heading | Fixed: the heading says “before code merges.” |
| F-4-11 vague README “Use” heading | Fixed: it says “Use the CLI.” |

No earlier finding is unfixed, half-fixed, or regressed.

## Structure, accessibility, links, and visual identity

- `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/404.html` each have one h1, one main, `lang="en"`, a route-appropriate title, description, canonical, OG/Twitter metadata, favicon, Apple icon, and consistent header/footer legal links.
- The home title follows “Product — what it does”; secondary titles follow “Route — Product.” An unknown route returns the designed 404 with HTTP 404.
- Direct routes, `/#install`, normal navigation, Back, and focus announcements work. Reduced motion disables the travelling capsule and animated scrolling.
- Ten Axe scans across five routes and two viewports found zero serious/critical violations. `/opt/fleet/lib/verify-url.sh` also passed with no console errors.
- All internal links and both external destinations (`sociobot.in` and the GitHub issue tracker) returned 200. No dead link was found.
- The live CSP and security headers match the loaded resources. All 15 deployed artifacts byte-match the local production build; immutable asset caching is present.
- Initial JavaScript is 1,424 bytes gzip and CSS is 2,940 bytes gzip. The mobile hero is 40,918 bytes. The build produces `dist/site` and `dist/bin/secret-injection-diff`.
- The cutaway conservatory art, field-journal hierarchy, clipped labels, serif/monospace pairing, acid/coral/ice palette, and restrained terminal ledger implement `.factory/design.md`. The result is distinct from a generic SaaS template.

## Missed leverage

No missing feature is implied strongly enough to raise a finding. This is a deterministic local parser, so an AI step would add cost and privacy risk without improving the core decision. JSON output, committed-baseline input, redaction, and CI exit statuses already cover the obvious export, import, and automation needs. No decorative AI, provider key, sync stub, or payment integration exists.

## Local verification

These checks passed:

```sh
# clean clone: every one of the 21 commands in .factory/claims.json
npm test
npm run lint
npm run typecheck
npm run build
npm run verify:live -- https://secret-injection-diff.sociobot.in /tmp/sid-review5-live-ixsVuE
/opt/fleet/lib/verify-url.sh https://secret-injection-diff.sociobot.in <temporary-output-directory>
```

`npm test` reported 9 Rust tests and 56 Playwright tests passing.

## What would make this perfect

Delete the untestable future-change promise from the Terms page, rebuild, and repeat the claim inventory check. No other product, demo, copy, structure, accessibility, privacy, or missed-leverage change is indicated.
