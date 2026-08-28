# Adversarial first-read review 6 — Secret Injection Diff

- Reviewed: 2026-08-28 UTC
- Live target: <https://secret-injection-diff.sociobot.in>
- Candidate: `12fb243d9b4512a1792aeee142cfd65c2594e131`
- Viewports: fresh Chromium contexts at 390 × 844 and 1440 × 900
- Verdict: **FAIL**

The public product is clear, immediately tryable, honest about its limits, and free of the earlier product defects. All 21 registered claim commands pass separately. The verdict is still FAIL because the required aggregate `npm test` gate failed in the clean clone: a build test rewrites the directory used by the running preview server while route tests run in parallel. The route test received a real 404 and an empty document. A second run passed, which confirms nondeterminism rather than clearing it. PASS requires zero findings and a reliable quality gate.

## Cold first read

I opened the live root in separate fresh mobile and desktop contexts. These answers were recorded at `scrollY = 0` before interaction or scrolling.

| Question | Answer in my own words | Exact first-screen evidence |
| --- | --- | --- |
| What does this do? | It checks configuration to show which process gets each secret name. | “Check which process gets each secret name” |
| For whom? | Developers reviewing CI and deployment changes. | “For developers reviewing CI and deploy changes before a new process gets a secret name.” |
| What should I click first? | **Try it with sample data**. | The primary action is visible at both sizes; “See the check fail when a new process gets a secret name” states the result. |

All three mobile fact rows also finish above the 844 px fold, at 657.13, 702.13, and 747.13 px. The first-read gate passes at both sizes.

## Findings

### F-6-1 — BLOCKING — the required `npm test` gate races against its own production build

- **Exact location:** [`tests/claims.spec.js:414`](/work/repo/tests/claims.spec.js:414) runs `npm run build` inside `@claim:build-artifacts`; [`vite.config.js:8`](/work/repo/vite.config.js:8) targets `dist/site` and empties it before building; [`playwright.config.js:13`](/work/repo/playwright.config.js:13) serves that same directory while Playwright runs test files with two workers.
- **Observed failure:** the first aggregate `npm test` run in clean clone `/tmp/sid-review6-clean-nxhgbe/repo` failed `tests/site.spec.js:16`, “`/privacy/ has the required document structure.” The trace recorded `GET http://127.0.0.1:4173/privacy/` returning 404, a console 404, an empty `<body>`, and `document.title === ""`. The other 56 tests passed. A direct reproduction that repeatedly requested `/privacy/` while `npm run build:site` rebuilt the served directory observed HTTP 404 on its first build round. The isolated route test, three focused two-worker runs, and a second aggregate run passed.
- **Why this fails:** the repository’s required quality gate is nondeterministic. A test that empties and rebuilds the files being served can make unrelated route tests fail or conceal a real route regression. A clean-clone gate cannot be treated as passing merely because a retry happens to pass.
- **Concrete fix:** do not rebuild the preview server’s live output from a parallel browser test. Run the build-artifact assertion as a serial preflight before Playwright starts, or build into a separate temporary output directory. Then repeat `npm test` enough times to confirm that every run passes without retry.

## Copy audit

Count method: whitespace-separated words. Raw commands in fenced code blocks are instructions rather than sentences and are excluded; their lead-in sentences, headings, labels, buttons, feedback, alt text, and meaningful output fragments are included. No item exceeds 22 words, no banned marketing adjective appears, the defined terms are consistent, headings name their sections, and the buttons use result-naming verbs. There is no copy finding.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Clear action |
| Secret Injection Diff | 3 | Product label |
| Demo | 1 | Navigation label |
| Install | 1 | Navigation label |
| Privacy | 1 | Navigation label |
| Local configuration audit / v0.1.0 | 5 | Useful context label |
| Check which process gets each secret name | 7 | Plain job headline |
| For developers reviewing CI and deploy changes before a new process gets a secret name. | 15 | Plain audience and situation |
| Try it with sample data | 5 | Result-naming action |
| See the check fail when a new process gets a secret name. | 12 | States the action result |
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
| Scroll sideways to read the full command and process path. | 10 | Responsive-use instruction |
| How it works | 3 | Section label |
| Review secret access in three commands | 6 | Informative heading |
| Save the baseline in your repository beside the configuration it describes. | 11 | Concrete instruction |
| Scan configuration | 2 | Step heading |
| Read secret names from supported files. | 6 | Listed adapter claims |
| List processes only when a supported file names them. | 9 | Listed `dotenv-capability` boundary |
| Commit the baseline | 3 | Step heading |
| Review the JSON list once, then approve it with the pull request. | 12 | Concrete instruction |
| Check every change | 3 | Step heading |
| Exit code 2 stops CI when a new process gets a secret name. | 13 | Listed claim `scope-change` |
| Supported files | 2 | Section label |
| Supported files and limits | 4 | Informative heading |
| .env and .env.* | 3 | File-type label |
| Docker Compose | 2 | File-type label |
| GitHub Actions | 2 | File-type label |
| Kubernetes workloads | 2 | File-type label |
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
| Select the command and copy it. | 6 | Recovery instruction |
| Then run secret-injection-diff scan. | 4 | Concrete next step |
| Map secret names to processes before code merges. | 8 | Product summary |
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
| The browser recording is at https://secret-injection-diff.sociobot.in/demo/?demo=1. | 6 | Working demo link |
| It uses bundled text and makes no third-party requests. | 9 | Listed claim `no-network` |
| Install | 1 | Informative heading |
| Run `npm run build` to package the release binary and build the documentation site. | 14 | Listed claim `build-artifacts`; test-isolation defect is F-6-1 |
| Use the CLI | 3 | Informative heading |
| List which processes get each secret name: | 7 | Concrete instruction |
| Save the current list as the approved baseline: | 8 | Concrete instruction |
| Check current access against the baseline in CI: | 8 | Concrete instruction |
| Exit code `0` means no process gained a secret name. | 10 | Listed claim `check-no-change-exit-zero` |
| Exit code `2` means at least one new process gained a secret name. | 13 | Listed claim `scope-change` |
| Invalid input uses exit code `1`. | 6 | Listed claim `invalid-input-exit-one` |
| Changing only the delivery method for the same secret name and process is reported, but the check still returns exit code `0`. | 22 | Listed claim `same-recipient-injection-change-exit-zero`; at the cap |
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
| The factory handles production deployment; this repository does not manage infrastructure. | 11 | Repository scope |
| Build and test the CLI and documentation site separately: | 9 | Concrete instruction |
| The project has no telemetry or paid service. | 8 | Listed claims `no-network` and `free-mit` |
| The website loads no files from another domain. | 8 | Listed claim `no-network` |
| See privacy and terms. | 4 | Clear link instruction |
| License | 1 | Informative heading |
| MIT | 1 | Listed claim `free-mit` |

Terminology remains stable: **secret name**, **process**, **declaration**, **delivery method**, **baseline**, **file type**, and **demo** each have one meaning.

## Demo and sandbox verification

- One click on **Try it with sample data** opened `/demo/?demo=1` in a fresh context.
- At 390 × 844, the terminal starts at 615.78 px and its final `exit 2` line ends at 722.16 px. The initial screen shows the real command, the realistic `NPM_TOKEN` process addition, the summary, the failure, and the exit code.
- The sticky banner says “Demo — sample data, nothing is saved” and retains **Reset demo** and **Start for real** after a bottom scroll. Reset restores the transcript and announces “Demo reset. Sample data is ready.”
- A pre-existing `localStorage` marker, `real:review-6-marker=keep`, remained unchanged after entering and resetting the demo. The demo added no local/session/IndexedDB/Cache Storage, cookie, or service-worker state.
- The full browser request log contains only `https://secret-injection-diff.sociobot.in`. The product makes no offline claim.
- From `/tmp/sid-review6-cli-5HdVCD`, the release CLI created a fresh `/tmp/secret-injection-diff-demo-*` workspace. The caller directory retained only its byte-identical sentinel file.

The browser and CLI demo gates pass.

## Claims verification

The repository was cloned to `/tmp/sid-review6-clean-nxhgbe/repo` at commit `12fb243d9b4512a1792aeee142cfd65c2594e131`, then received a fresh `npm ci`. Every exact command in `.factory/claims.json` was run separately. All 21 selected one matching tagged test and passed.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `adapters` | Pass | Bundled JSON contains all four documented file types. |
| `dotenv-capability` | Pass | Standalone names remain declarations; Compose binding creates process access. |
| `compose-capability` | Pass | Environment, scalar/list `env_file`, and short/long secret forms pass. |
| `github-actions-capability` | Pass | Job env, step env, and reusable-workflow inheritance pass. |
| `kubernetes-capability` | Pass | Three secret forms pass; ConfigMaps remain excluded. |
| `scope-change` | Pass | A new process exits 2; a delivery-only refactor does not. |
| `same-recipient-injection-change-exit-zero` | Pass | Same process/name with a new delivery method exits 0. |
| `check-no-change-exit-zero` | Pass | An unchanged project exits 0. |
| `diff-addition-exit-zero` | Pass | An addition is printed and `diff` exits 0. |
| `invalid-input-exit-one` | Pass | Missing input returns an actionable error and exit 1. |
| `values-excluded` | Pass | Fixture values are absent while secret names remain. |
| `redaction` | Pass | Opaque numbered labels replace all names; 200 remain unique. |
| `isolated-demo` | Pass | A fresh OS-temporary workspace is used and samples remain unchanged. |
| `json-output` | Pass | Schema 1 JSON includes process-access fields. |
| `no-network` | Pass | CLI commands make no recorded socket/connect/send/DNS calls; browser requests are same-origin. |
| `free-mit` | Pass | The MIT license exists and no payment path exists. |
| `no-decryption-storage` | Pass | Values are absent; input remains unchanged and no output file appears. |
| `snapshot-only-write` | Pass | Only explicit `snapshot` writes the requested baseline. |
| `site-data-free` | Pass | Five routes create no service worker, cache, cookie, form, account, analytics, browser storage, or third-party request. |
| `build-artifacts` | Pass alone | It creates both documented outputs; its in-suite rebuild causes F-6-1. |
| `explicit-adapter-limits` | Pass | Vendor-style inputs create no access and no watcher integration exists. |

The live landing, demo, privacy, terms, metadata, and README were cross-checked against the registry. No claim-like sentence lacks a `claims.json` entry. No registered claim test failed when run by its exact command.

## Earlier findings rechecked

Every earlier `review-*.md`, `polish-*.md`, and handoff was read. Each prior finding was checked against the public site and current code.

### Review 1

| Finding | Current confirmation |
| --- | --- |
| F-1-1 browser storage contradiction | Fixed: no service worker, cache, cookie, or site-created browser storage exists. |
| F-1-2 incomplete 404 metadata | Fixed: canonical, OG/Twitter, favicon, and Apple icon are present. |
| F-1-3 route focus | Fixed: Demo, Back, and demo-to-install focus and announce their destination headings. |
| F-1-4 graph jargon | Fixed: visitor and human CLI copy use process/access language. |
| F-1-5 inconsistent secret terminology | Fixed: visitor copy consistently uses “secret name.” |
| F-1-6 untested Rust version | Fixed: no numeric compiler-minimum promise exists. |
| F-1-7 build-output promises | The artifacts and claim pass; F-6-1 is a new test-isolation defect. |
| F-1-8 partial exit-code coverage | Fixed: exit 0, 1, and 2 have passing claim tests. |

### Review 2

| Finding | Current confirmation |
| --- | --- |
| F-2-1 normal route/Back focus | Fixed on the live site and in route tests. |
| F-2-2 credential overclaim | Fixed: the hero promises only observable secret-name access. |
| F-2-3 metaphorical 404 heading | Fixed: the heading is “Page not found.” |

### Review 3

| Finding | Current confirmation |
| --- | --- |
| F-3-1 delivery-method false failure | Fixed: the same-process refactor exits 0 and is reported separately. |
| F-3-2 demo output below mobile fold | Fixed: the final output line ends at 722.16 px. |
| F-3-3 nonpersistent demo banner | Fixed: the banner remains visible at the bottom scroll position. |
| F-3-4 undefined graph terms | Fixed: rejected terms remain absent from visitor and human CLI copy. |
| F-3-5 README “identifiers” | Fixed: README says “secret names.” |
| F-3-6 unlisted `diff` exit behavior | Fixed: `diff-addition-exit-zero` passes. |
| F-3-7 dotenv detail | Fixed: the claim distinguishes declaration-only and bound behavior. |
| F-3-8 Compose detail | Fixed: all documented forms pass. |
| F-3-9 GitHub Actions detail | Fixed: all documented forms pass. |
| F-3-10 Kubernetes detail | Fixed: all documented forms and ConfigMap negatives pass. |
| F-3-11 “Specimen 02” | Fixed: replaced by “Sample result.” |
| F-3-12 “Field method” | Fixed: replaced by “How it works.” |
| F-3-13 “Known terrain” | Fixed: replaced by “Supported files.” |
| F-3-14 “Outside the fence” | Fixed: replaced by “Limits.” |
| F-3-15 CSS-generated jargon | Fixed: a semantic figure caption names the relationship. |
| F-3-16 vague README transition | Fixed: it names the CLI and documentation site. |

### Review 4

| Finding | Current confirmation |
| --- | --- |
| F-4-1 dotenv files reported as processes | Fixed: standalone entries are declarations until a supported binding names a process. |
| F-4-2 reversible redaction | Fixed: per-output opaque numbered labels replace names. |
| F-4-3 unobserved CLI network claim | Fixed: the claim records network syscalls around every CLI action. |
| F-4-4 mobile facts below fold | Fixed: all three end above 748 px. |
| F-4-5 hidden horizontal-scroll requirement | Fixed: a conditional visible instruction appears with clipped output. |
| F-4-6 baseline-location overclaim | Fixed: the sentence is an instruction. |
| F-4-7 nonexistent demo report file | Fixed: README names the result and workspace path. |
| F-4-8 overbroad isolation sentence | Fixed: README names the caller-project boundary. |
| F-4-9 undefined “injection paths” | Fixed: visitor and human output say “delivery methods.” |
| F-4-10 incomplete “before merge” heading | Fixed: the heading says “before code merges.” |
| F-4-11 vague README “Use” heading | Fixed: it says “Use the CLI.” |

### Review 5

| Finding | Current confirmation |
| --- | --- |
| F-5-1 untestable Terms change promise | Fixed: the sentence and empty **Changes** section remain absent live and in source. |

No earlier finding is unfixed, half-fixed, or regressed.

## Structure, accessibility, links, and visual identity

- `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/404.html` each have one h1, one main, `lang="en"`, route-specific title/description/canonical/OG/Twitter metadata, favicon, Apple icon, and consistent header/footer legal links.
- The home title follows “Product — what it does”; secondary titles follow “Route — Product.” An unknown route returns the designed page with HTTP 404.
- Direct routes, `/#install`, normal navigation, Back, and route focus announcements work on the deployment.
- Ten live Axe scans across five routes and two viewports found zero serious or critical violations. `verify-url.sh` passed with HTTP 200, title/lang/main/h1/alt checks, and no console errors.
- All local links and both external destinations returned their expected successful status. No dead link was found.
- Security headers match the loaded resources. All 15 deployed files byte-match the local production build. Initial JavaScript is 1.40 kB gzip, CSS is 2.94 kB gzip, and the mobile hero is 40,918 bytes.
- The cutaway conservatory, editorial hierarchy, clipped paper shapes, serif/monospace pairing, and acid/coral/ice palette implement `.factory/design.md`. The identity is not a generic SaaS template.

F-6-1 is a local verification race; the public `/privacy/` route returned 200 and passed both live viewport checks.

## Missed leverage

No missing AI, import/export, or sync feature is implied strongly enough to raise a finding. This is a deterministic local parser; an AI step would add cost and privacy risk without improving the access decision. JSON output, baseline input, redaction, and CI exit statuses cover the obvious export, import, sharing, and automation needs. No AI provider key or decorative AI feature exists.

## Verification summary

- Clean clone and fresh install: pass.
- All 21 exact claim commands, run separately: pass.
- First clean-clone `npm test`: **fail**, 56 passed and one route test failed with a transient 404; F-6-1.
- Immediate clean-clone `npm test` rerun: pass, 9 Rust tests and 57 Playwright tests.
- Isolated failed route rerun and three focused two-worker race attempts: pass.
- Direct preview/build overlap check: reproduced HTTP 404 for `/privacy/` during the first rebuild.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `cargo package --allow-dirty`: pass.
- Public live audit: pass, 10 route/viewport checks, zero serious/critical Axe findings, and 15/15 artifact hashes matched.
- `/opt/fleet/lib/verify-url.sh`: pass.

## What would make this perfect

Remove the build/output race so the aggregate suite never mutates the directory its preview server is serving. Run the build claim as an isolated preflight or use a separate temporary output directory, then demonstrate repeated clean-clone `npm test` passes without retries. No product copy, demo, claim, privacy, routing, accessibility, visual, or feature change is otherwise indicated.
