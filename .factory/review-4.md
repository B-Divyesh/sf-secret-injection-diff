# Adversarial first-read review 4 — Secret Injection Diff

- Reviewed: 2026-08-28 UTC
- Live target: <https://secret-injection-diff.sociobot.in>
- Candidate: `8c17ef6488e42afbb94791fb952a7bafcf961aaf`
- Viewports: fresh Chromium contexts at 390 × 844 and 1440 × 900
- Verdict: **FAIL**

The first-read and browser-demo gates pass, and all 21 registered claim commands pass. The product still fails because a standalone `.env` file is reported as a process, the recommended redaction is reversible for predictable secret names, and the CLI half of the no-network claim is not observed by its test. Eight smaller first-screen, demo, and copy defects also remain.

## Cold first read

Both live contexts were fresh. The following was recorded at `scrollY = 0` before interaction or scrolling.

| Question | First-read answer | Exact visible evidence |
| --- | --- | --- |
| What does it do? | Checks which process gets each secret name. | “Prove which process gets each secret name” |
| For whom? | Developers reviewing CI and deployment changes. | “For developers reviewing CI and deploy changes before a new process gets a secret name.” |
| What should I click first? | **Try it with sample data**. | The primary action was at y=597–645 on mobile and y=716–765 on desktop. |

This three-question gate passes. The mobile screenshot nevertheless exposes F-4-4: only one of the three required fact lines fits completely before the fold.

## Findings

### F-4-1 — BLOCKING — `.env` files are reported as processes even though they declare no recipient

- **Quote/location:** landing headline, “Prove which process gets each secret name”; CLI help, “List which processes get secret names in supported files”; `src/parsers.rs:103`, `recipient: format!("env-file:{source}")`.
- **Evidence:** `secret-injection-diff scan examples/demo/after --json` returns `DATABASE_URL -> env-file:.env.production` and `QUEUE_TOKEN -> env-file:.env.production` alongside the actual Compose recipient. A file is not a process and a standalone `.env` file does not say which process, if any, loads it. The `dotenv-capability` claim test checks names and sources but does not check that the reported recipient is real.
- **Why this fails:** the product’s central promise and CI boundary are process access. Adding a name to an unused `.env` file can be presented as a new process gaining access even though no process is declared. The result cannot support the access decision described on the first screen.
- **Concrete fix:** represent standalone `.env` entries as unresolved declarations, not process recipients, and exclude them from process-addition failures. Create process access only when another supported file binds the env file to a process, such as Compose `env_file`. Add a claim test in which an unused `.env` name does not create a process addition and a Compose binding does.

### F-4-2 — BLOCKING — `--redact` leaves predictable secret names recoverable

- **Quote/location:** README, “Use `--redact` before sharing a report.”; `.factory/claims.json`, “The `--redact` option replaces secret names with stable hashes”; `src/main.rs`, `stable_redaction`.
- **Evidence:** the implementation uses unkeyed FNV-1a and publishes only 32 bits. A local four-item dictionary reproduced live output exactly: `NPM_TOKEN` → `secret_39225bb4`, `DATABASE_URL` → `secret_649fc35d`, and `AWS_SECRET_ACCESS_KEY` → `secret_8cab224d`. The claim test locks deterministic replacement and absence of raw text, but never tests resistance to guessing or collisions.
- **Why this fails:** the brief treats names as sensitive and README directs users to this option before sharing. Common secret names have very low entropy, so a recipient can recover them with a small dictionary. A 32-bit token also permits practical collisions in larger collections.
- **Concrete fix:** use opaque per-report labels such as `secret_001`, or a keyed HMAC when stable cross-report correlation is required. State the correlation boundary. Add tests for no dictionary-derived token, no collision across a large fixture, and complete removal of names from every output field. Until then, rewrite the instruction to warn that deterministic hashes can reveal common names.

### F-4-3 — BLOCKING — the CLI no-network claim is not tested observably

- **Quote/location:** `.factory/claims.json` `no-network`, “The CLI has no network or telemetry client”; `tests/claims.spec.js`, `@claim:no-network`.
- **Evidence:** the CLI half of the test only rejects selected dependency names in `Cargo.toml`. Rust can open sockets through `std::net` without any listed dependency. The Playwright request log proves the browser half, but the test never records network syscalls or connection attempts while the CLI demo runs.
- **Why this fails:** “no network” is a privacy claim, and the claims contract requires the observable outcome to be tested. A passing dependency-name check does not prove the CLI behavior, leaving part of a listed claim untested.
- **Concrete fix:** run `secret-injection-diff demo`, `scan`, `snapshot`, `diff`, and `check` under a network-syscall recorder in the claim sandbox and assert no outbound socket/connect/send activity. Retain the browser request log and source/dependency checks as secondary evidence.

### F-4-4 — Minor — the mobile first screen does not show all three required facts

- **Quote/location:** live 390 × 844 home page facts: “Runs locally · no network calls”, “Reports secret names · never values”, and “Free · MIT licensed”.
- **Evidence:** the first fact is fully visible at y=764.80–816.80. The second ends at y=869.80 and the third begins at y=870.80, below the 844 px viewport.
- **Why this fails:** the required first-screen shape calls for all three plain facts. Privacy and price are not available without scrolling on a common phone viewport.
- **Concrete fix:** shorten the hero’s vertical rhythm or place the three facts in a compact row/list so all three finish above y=844. Add a Playwright assertion for every fact’s bottom edge.

### F-4-5 — Minor — the mobile demo clips the result with no visible horizontal-scroll instruction

- **Quote/location:** `/demo/?demo=1`, terminal line `+ NPM_TOKEN -> github:job/verify/step/Publish package  [env:NPM_TOKEN]`.
- **Evidence:** the first demo viewport contains the terminal and `exit 2`, but the 390 px screenshot clips the command and recipient path horizontally. `pre` is scrollable and keyboard focusable, yet no visible copy tells a phone visitor to scroll sideways. `.factory/design.md` explicitly requires “a horizontally scrollable ledger with a visible instruction.”
- **Why this fails:** the visitor sees that something failed but cannot read the complete process path without discovering an invisible gesture.
- **Concrete fix:** wrap or reformat the transcript on mobile, or add “Scroll sideways to read the full command and process path” next to the terminal. Test that the instruction is visible whenever `scrollWidth > clientWidth`.

### F-4-6 — Minor — the landing page makes an unlisted and unenforced baseline-location claim

- **Quote/location:** landing “How it works”, “The baseline stays in your repository beside the configuration it describes.”
- **Evidence:** no `.factory/claims.json` entry states or tests this location. `snapshot --output` accepts an arbitrary path, and the bundled demo writes its baseline under the operating-system temporary directory.
- **Why this fails:** “stays” describes an enforced storage property, but the CLI lets the user put the file elsewhere.
- **Concrete fix:** rewrite it as the instruction “Save the baseline in your repository beside the configuration it describes.” Alternatively, constrain and test the output location and register the claim.

### F-4-7 — Minor — README says a temporary report exists when the demo creates no report file

- **Quote/location:** README demo section, “It compares an approved workflow with a changed workflow and prints where the temporary report lives.”
- **Evidence:** `secret-injection-diff demo` prints a temporary workspace and `baseline.json`, then prints the comparison to stdout. It does not create a report file.
- **Why this fails:** a user looking for the promised report is sent to a directory that contains samples and a baseline, not a report.
- **Concrete fix:** rewrite as “It compares an approved workflow with a changed workflow, prints the result, and shows the temporary workspace path.”

### F-4-8 — Minor — README’s demo isolation sentence is overbroad

- **Quote/location:** README demo section, “It never reads or writes project data.”
- **Evidence:** the command necessarily reads the bundled sample project before copying it. The tested boundary is that it does not read or write the caller’s project.
- **Why this fails:** “project data” is undefined and literally includes the shipped sample project. The sentence obscures the useful isolation guarantee.
- **Concrete fix:** rewrite as “It does not read or write the project where you run the command.”

### F-4-9 — Minor — “injection paths” is undefined visitor-facing jargon

- **Quote/location:** landing transcript, “0 injection paths changed”; README, “Reports contain secret names, process names, and injection paths” and “Changing only the injection path…”
- **Why this fails:** the phrase is not defined before use. A first-time reader cannot tell that it means the delivery method, such as an environment variable versus a mounted file.
- **Concrete fix:** use “delivery method” in prose and human output: “0 delivery methods changed”; “Reports contain secret names, process names, and delivery methods.” Keep `injection` only as a documented JSON field if compatibility requires it.

### F-4-10 — Minor — the sample-result heading is grammatically incomplete

- **Quote/location:** landing heading, “See which process gets a secret name before merge”.
- **Why this fails:** “before merge” is repository shorthand rather than a complete plain-language time reference.
- **Concrete fix:** “See which process gets a secret name before code merges.”

### F-4-11 — Minor — the README heading “Use” does not name its section out of context

- **Quote/location:** README `## Use`.
- **Why this fails:** a screen-reader heading list does not say what is being used.
- **Concrete fix:** rename it “Use the CLI”.

## Copy audit

Method: whitespace-separated word counts. Raw shell commands are not sentences and are excluded. Headings, labels, buttons, feedback, alt text, and meaningful terminal fragments are included because visitors read them. No item exceeds 22 words and no banned marketing adjective appears. F-4-7 through F-4-11 are the copy flags; every landing button uses a result-naming verb.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Pass |
| Secret Injection Diff | 3 | Product label |
| Demo | 1 | Navigation label |
| Install | 1 | Navigation label |
| Privacy | 1 | Navigation label |
| Local configuration audit / v0.1.0 | 5 | Context label |
| Prove which process gets each secret name | 7 | Core claim contradicted for `.env` — F-4-1 |
| For developers reviewing CI and deploy changes before a new process gets a secret name. | 14 | Pass |
| Try it with sample data | 6 | Result-naming action |
| See the check fail when a new process gets a secret name. | 12 | Pass |
| Runs locally · no network calls | 6 | Listed claim; CLI proof gap — F-4-3 |
| Reports secret names · never values | 6 | Listed claim `values-excluded` |
| Free · MIT licensed | 4 | Listed claim `free-mit` |
| A cutaway conservatory shows glowing capsules routed into separate plant rooms. | 11 | Image alternative |
| Secret names mapped to processes | 5 | Figure caption |
| Sample result | 2 | Section label |
| See which process gets a secret name before merge | 9 | Incomplete phrasing — F-4-10 |
| The check compares current secret access with a committed baseline. | 10 | Listed claim `scope-change` |
| release.yml / process access | 4 | Output label |
| 1 process added, 0 removed; 0 injection paths changed | 9 | Undefined jargon — F-4-9 |
| check failed: an unapproved process gained a secret name | 9 | Listed claim `scope-change` |
| exit 2 | 2 | Listed claim `scope-change` |
| How it works | 3 | Section label |
| Review secret access in three commands | 6 | Pass |
| The baseline stays in your repository beside the configuration it describes. | 11 | Unlisted/unenforced claim — F-4-6 |
| Scan configuration | 2 | Heading |
| Read secret names from supported files and list each process that receives them. | 13 | Contradicted for standalone `.env` — F-4-1 |
| Commit the baseline | 3 | Heading |
| Review the JSON list once, then approve it with the pull request. | 12 | Pass |
| Check every change | 3 | Heading |
| Exit code 2 stops CI when a new process gets a secret name. | 13 | Listed claim `scope-change` |
| Supported files | 2 | Section label |
| Supported files and limits | 4 | Heading |
| .env and .env.* | 3 | File label |
| Docker Compose | 2 | File label |
| GitHub Actions | 2 | File label |
| Kubernetes workloads | 2 | File label |
| Limits | 1 | Section label |
| What it does not do | 5 | Heading |
| It does not read secret stores. | 6 | Listed claim `explicit-adapter-limits` |
| It does not decrypt values. | 5 | Listed claim `no-decryption-storage` |
| It does not watch running processes. | 6 | Listed claim `explicit-adapter-limits` |
| It does not guess vendor behavior. | 6 | Listed claim `explicit-adapter-limits` |
| Start with your repository | 4 | Context label |
| Install the local CLI | 4 | Heading |
| Copy command | 2 | Result-naming button |
| Install command copied. | 3 | Success feedback |
| Copy failed. Select the command and copy it. | 8 | Error plus recovery |
| Then run secret-injection-diff scan. | 4 | Instruction |
| Map secret names to processes before merge. | 7 | Product one-liner |
| v0.1.0 · build 2026-08-28 | 4 | Build label |
| Terms | 1 | Footer link |
| Built by Param Factory (external) | 5 | Attribution link |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Secret Injection Diff | 3 | Heading |
| Prove which processes gain secret names before a pull request merges. | 11 | Core claim contradicted for `.env` — F-4-1 |
| This local CLI is for developers reviewing secret access across `.env`, Docker Compose, GitHub Actions, and Kubernetes files. | 18 | Listed adapter claims |
| It records which processes get secret names and compares them with an approved baseline. | 14 | Contradicted for standalone `.env` — F-4-1 |
| It returns exit code `2` when a new process gets a secret name. | 13 | Listed claim `scope-change` |
| The scanner does not decrypt or store secret values. | 9 | Listed claim `no-decryption-storage` |
| Reports contain secret names, process names, and injection paths. | 9 | Undefined jargon — F-4-9 |
| Use `--redact` before sharing a report. | 6 | Unsafe implication — F-4-2 |
| Try the isolated demo | 4 | Heading |
| The command copies the shipped sample project into a new temporary directory. | 12 | Listed claim `isolated-demo` |
| It compares an approved workflow with a changed workflow and prints where the temporary report lives. | 16 | Inaccurate — F-4-7 |
| It never reads or writes project data. | 7 | Overbroad — F-4-8 |
| The browser recording is at https://secret-injection-diff.sociobot.in/demo/?demo=1. | 6 | Demo URL |
| It uses bundled text and makes no third-party requests. | 9 | Listed claims `isolated-demo`, `no-network` |
| Install | 1 | Heading |
| Run `npm run build` to package the release binary and build the documentation site. | 13 | Listed claim `build-artifacts` |
| Use | 1 | Vague heading — F-4-11 |
| List which processes get each secret name: | 7 | Contradicted for standalone `.env` — F-4-1 |
| Save the current list as the approved baseline: | 8 | Instruction |
| Check current access against the baseline in CI: | 8 | Instruction |
| Exit code `0` means no process gained a secret name. | 10 | Listed claim `check-no-change-exit-zero` |
| Exit code `2` means at least one new process gained a secret name. | 13 | Listed claim `scope-change` |
| Invalid input uses exit code `1`. | 6 | Listed claim `invalid-input-exit-one` |
| Changing only the injection path for the same secret name and process is reported, but the check still returns exit code `0`. | 21 | Undefined jargon; listed comparison claim — F-4-9 |
| Use `diff` when you want the same comparison without a failing exit code. | 13 | Listed claim `diff-addition-exit-zero` |
| Supported files | 2 | Heading |
| `.env` and `.env.*`: declared uppercase secret names. | 7 | Listed claim `dotenv-capability` |
| Values are discarded and never printed. | 6 | Listed claim `values-excluded` |
| Docker Compose: `environment`, `env_file`, and service `secrets` entries. | 8 | Listed claim `compose-capability` |
| GitHub Actions: `secrets.NAME` references in job or step `env`, plus reusable workflow secret inheritance. | 14 | Listed claim `github-actions-capability` |
| Kubernetes: `secretKeyRef`, `envFrom.secretRef`, and mounted secret volumes in Pod templates. | 10 | Listed claim `kubernetes-capability` |
| The CLI does not guess the behavior of Vault, SOPS, Doppler, 1Password, or cloud secret managers. | 16 | Listed claim `explicit-adapter-limits` |
| Add support for those sources before relying on them. | 9 | Instruction |
| Develop and verify | 3 | Heading |
| The site build lands in `dist/site`. | 6 | Listed claim `build-artifacts` |
| The release CLI lands in `dist/bin`. | 6 | Listed claim `build-artifacts` |
| Deploy the contents of `dist/site` to a static host. | 9 | Instruction |
| The factory handles production deployment; this repository does not manage infrastructure. | 11 | Scope statement |
| Build and test the CLI and documentation site separately: | 9 | Instruction |
| The project has no telemetry or paid service. | 8 | Listed claims `no-network`, `free-mit` |
| The website loads no files from another domain. | 8 | Listed claim `no-network` |
| See privacy and terms. | 4 | Link instruction |
| License | 1 | Heading |
| MIT | 1 | License label |

## Demo and sandbox verification

- One click on **Try it with sample data** reached `/demo/?demo=1`.
- At 390 × 844, the terminal began at y=615.78 and its `exit 2` line ended at y=722.16. The full realistic `NPM_TOKEN` scenario was already in the DOM. F-4-5 covers its horizontal clipping.
- The persistent banner read “Demo — sample data, nothing is saved” and exposed **Reset demo** and **Start for real**. Reset restored the complete transcript and announced “Demo reset. Sample data is ready.”
- After scrolling to the bottom, the sticky banner remained at y=0–80.14 with both controls visible.
- A pre-existing `localStorage` marker named `real:review-marker` remained exactly `keep` through demo entry, replay, reset, Start for real, and Back. The demo added no local/session/IndexedDB/Cache Storage, cookie, or service-worker state.
- Every browser request used `https://secret-injection-diff.sociobot.in`; there were no console or page errors. There is no offline-use claim.
- From the empty caller directory `/tmp/sid-review4-caller`, the clean-clone binary created `/tmp/secret-injection-diff-demo-6071-1787953527395`, printed its baseline path, and left the caller directory empty.

## Claims verification

A clean clone at `/tmp/sid-review4-clean` received `npm ci`. Every exact command in `.factory/claims.json` was run separately. All 21 commands selected exactly one tagged test and passed.

| Claim | Result |
| --- | --- |
| `adapters` | Pass |
| `dotenv-capability` | Pass; does not validate a real process boundary — F-4-1 |
| `compose-capability` | Pass |
| `github-actions-capability` | Pass |
| `kubernetes-capability` | Pass |
| `scope-change` | Pass |
| `same-recipient-injection-change-exit-zero` | Pass |
| `check-no-change-exit-zero` | Pass |
| `diff-addition-exit-zero` | Pass |
| `invalid-input-exit-one` | Pass |
| `values-excluded` | Pass |
| `redaction` | Pass for deterministic replacement; unsafe sharing boundary remains — F-4-2 |
| `isolated-demo` | Pass |
| `json-output` | Pass |
| `no-network` | Test passes, but CLI behavior is not observed — F-4-3 |
| `free-mit` | Pass |
| `no-decryption-storage` | Pass |
| `snapshot-only-write` | Pass |
| `site-data-free` | Pass |
| `build-artifacts` | Pass |
| `explicit-adapter-limits` | Pass |

The live landing, demo, privacy, terms, and README were cross-checked against the inventory. F-4-6 is the unlisted claim. F-4-3 is a listed but incompletely tested claim. No declared command returned a failing status.

## Earlier findings checked again

Every earlier `review-*.md`, `polish-*.md`, verification report, and the prior handoff was read. Each finding was checked on the deployed site and in current code rather than accepted from its closure note.

| Earlier finding | Current verification |
| --- | --- |
| F-1-1 browser storage contradiction | Fixed: no service worker, cache, cookie, or site-created browser storage; `/sw.js` is absent. |
| F-1-2 incomplete 404 metadata | Fixed: canonical, description, OG/Twitter, favicon, and Apple icon are present. |
| F-1-3 demo-to-install focus | Fixed: the install heading receives focus and the live region announces it. |
| F-1-4 graph jargon | Fixed for the cited recipient/edge/scope/adapter terms. F-4-9 is a different remaining term. |
| F-1-5 inconsistent secret-name term | Fixed: visitor copy consistently says “secret name.” |
| F-1-6 untested Rust version | Fixed: no numeric minimum remains. |
| F-1-7 build outputs | Fixed: `build-artifacts` passes and both paths are populated. |
| F-1-8 exit statuses | Fixed: exit 0, 1, and 2 have separate passing claims. |
| F-2-1 normal route and Back focus | Fixed: Home → Demo → Back focuses and announces each h1. |
| F-2-2 credential overclaim | Fixed: the first screen uses “secret name,” not “credential.” |
| F-2-3 metaphorical 404 heading | Fixed: the h1 is “Page not found.” |
| F-3-1 injection-method false failure | Fixed: the exact same-process refactor returns 0 and has a passing negative claim. |
| F-3-2 mobile demo output below fold | Fixed: command/result/exit line end above y=844. |
| F-3-3 nonpersistent banner | Fixed: the banner remains sticky at the bottom scroll position. |
| F-3-4 remaining graph terminology | Fixed for all cited terms in visitor copy and human CLI output. |
| F-3-5 README “identifiers” | Fixed: README says “secret names.” |
| F-3-6 unlisted non-failing `diff` | Fixed: `diff-addition-exit-zero` is registered and passes. |
| F-3-7 dotenv detail | Fixed: `dotenv-capability` is registered and passes, subject to new F-4-1. |
| F-3-8 Compose detail | Fixed: `compose-capability` passes all documented forms. |
| F-3-9 GitHub Actions detail | Fixed: `github-actions-capability` passes. |
| F-3-10 Kubernetes detail | Fixed: `kubernetes-capability` passes with ConfigMap negatives. |
| F-3-11 “Specimen 02” | Fixed: replaced by “Sample result.” |
| F-3-12 “Field method” | Fixed: replaced by “How it works.” |
| F-3-13 “Known terrain” | Fixed: replaced by “Supported files.” |
| F-3-14 “Outside the fence” | Fixed: replaced by “Limits.” |
| F-3-15 generated art label | Fixed: semantic caption says “Secret names mapped to processes.” |
| F-3-16 vague README transition | Fixed: it now names the CLI and documentation site. |

No earlier finding is reopened under its old ID.

## Structure, accessibility, links, and visual identity

- `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/404.html` each have one h1, one main, `lang="en"`, route-appropriate title/description/canonical/OG/Twitter metadata, favicon, consistent header/footer, Privacy, and Terms links.
- The home title follows “Product — what it does”; secondary titles follow “Route — Product”. An unknown URL returns the designed 404 with HTTP 404. Direct routes, the install deep link, keyboard navigation, Back, and focus announcements work.
- All crawled links returned 200, excluding the deliberately requested unknown route itself. GitHub Issues and Sociobot returned 200.
- The live verifier audited ten route/viewport combinations: zero serious/critical Axe violations, no page/console errors, no horizontal document overflow, and 15/15 deployed artifacts matching the local production build.
- `/opt/fleet/lib/verify-url.sh` passed after its output directory was created. Reduced motion, 44 px controls, visible focus, alt text, and the skip link are present.
- Production gzip is 1.30 kB JavaScript and 2.89 kB CSS. The build produced `dist/site` and `dist/bin/secret-injection-diff`.
- The conservatory illustration, field-journal typography, clipped paper geometry, and restrained ledger match `.factory/design.md` and are visually distinct from a generic SaaS template. F-4-5 is the one unmet responsive design instruction.

## Missed leverage

No AI feature is justified for this deterministic local parser. It already provides JSON export, committed-baseline import, and CI exit statuses; no sync service is implied by the privacy-first brief. No provider key or AI call is embedded. The obvious missing product behavior is accurate unresolved `.env` handling, covered by F-4-1, rather than an AI feature.

## Local verification

- Clean clone: `npm ci`, then 21/21 exact claim commands passed separately.
- Current checkout: `npm test` passed 9 Rust tests and 54 Playwright tests.
- `npm run lint`, `npm run typecheck`, and `npm run build` passed.
- `npm run verify:live -- https://secret-injection-diff.sociobot.in /tmp/sid-review4-live` passed its implemented checks.
- `/opt/fleet/lib/verify-url.sh https://secret-injection-diff.sociobot.in /tmp/sid-review4-verify-url` passed.

## What would make this perfect

Stop representing unresolved `.env` declarations as processes; replace reversible 32-bit name hashes with opaque or keyed redaction; observe CLI network behavior in the claim test; fit all three facts in the mobile first screen; make horizontally clipped demo output discoverable; remove the baseline-location overclaim; and apply the four proposed plain-language rewrites. Then rerun every registered claim and this entire cold live review. PASS requires zero findings.
