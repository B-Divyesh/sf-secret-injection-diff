# Adversarial first-read review 3 — Secret Injection Diff

- Reviewed: 2026-08-28 UTC
- Live target: <https://secret-injection-diff.sociobot.in>
- Candidate: `d13343334846887fe4a1056b4509bdb2b46af3de`
- Viewports: fresh Chromium contexts at 390 × 844 and 1440 × 900
- Verdict: **FAIL**

The first-read gate passes, all 15 registered claim commands pass, and the site structure is sound. The product still fails this review because its core check reports a new recipient when only the injection method changed, and the mobile demo does not show the recorded CLI output in its first viewport. The demo banner also stops being visible after scrolling. Earlier terminology findings remain partly open, and README capability promises are not individually registered or tested as claims.

## Cold first read

The live home page was opened before repository copy was inspected and without scrolling.

| Question | First-read answer | Exact first-screen evidence |
| --- | --- | --- |
| What does it do? | Shows which process gets each secret name and checks access changes. | “Prove which process gets each secret name” |
| For whom? | Developers reviewing CI and deployment changes. | “For developers reviewing CI and deploy changes before a new process gets a secret name.” |
| What should I click first? | **Try it with sample data**. | Primary action at y=597 on mobile and y=716 on desktop |

All three answers are available in the first viewport at both sizes. The home page had no console error or horizontal overflow.

## Findings

### F-3-1 — BLOCKING — an injection-method change is falsely reported as a new recipient

- **Quote/location:** live headline, “Prove which process gets each secret name”; live fact, “Exit code 2 stops CI when a new process gets a secret name”; CLI error, “check failed: an undeclared recipient gained a secret name.” In `src/model.rs`, `Edge::identity()` compares `(secret, recipient, injection)`.
- **Evidence:** a clean-clone baseline gave `API_TOKEN` to `compose:service/api` through `environment:API_TOKEN`. The current configuration gave the same `API_TOKEN` to the same `compose:service/api` through `secret mount:/run/secrets/token`. `check` returned 2 and printed one addition and one removal, followed by the quoted new-recipient error. No process or recipient was added.
- **Why this fails:** the primary CI gate produces a false failure for an ordinary refactor and describes an unchanged recipient as undeclared. This contradicts the job-to-be-done and the registered `scope-change` claim, even though its happy-path claim test passes.
- **Concrete fix:** gate additions by `(secret, recipient)`. Report injection-path changes separately without exit 2, or state and test a broader injection-edge policy everywhere. Add `@claim:same-recipient-injection-change-exit-zero` using the Compose environment-to-secret-mount fixture above, and extend `scope-change` with a negative assertion.

### F-3-2 — BLOCKING — the mobile demo does not show the product output in its first screen

- **Quote/location:** `/demo/?demo=1` at 390 × 844. The first viewport shows “The publish step gains NPM_TOKEN,” but the recorded terminal output starts below it.
- **Evidence:** the result heading spans y=723–794; the terminal frame begins at y=834; the actual terminal output begins at y=920, below the 844 px viewport. The screenshot therefore shows no command, changed recipient line, count, or exit status without scrolling.
- **Why this fails:** the demo contract requires the first screen after one click to show the product being used with realistic sample data. A result heading is a description of the demo, not the CLI in use. Missing or weak demo behavior is blocking.
- **Concrete fix:** place the terminal directly below the demo banner on mobile, or shorten the banner/header/intro so the command plus the `NPM_TOKEN` addition and exit status are visible within 390 × 844. Add a viewport assertion that `[data-terminal]` begins above `window.innerHeight` and that its first result line is visible without scrolling.

### F-3-3 — BLOCKING — the demo banner is not persistent

- **Quote/location:** `/demo/?demo=1`, “Demo — sample data, nothing is saved.”
- **Evidence:** after scrolling to y=1549 on the 390 px page, `.demo-banner` had `position: static`, top `-1549`, bottom `-1468.86`, and was not visible.
- **Why this fails:** the demo contract requires a persistent banner with **Reset demo** and **Start for real** while demo mode is shown. The controls and sandbox notice disappear during the sample walkthrough.
- **Concrete fix:** make the banner sticky or fixed with collision-safe spacing and retain it throughout `/demo`. Add a mobile test that scrolls to the bottom and asserts that the banner and both controls remain in the viewport.

### F-3-4 / recurrence of F-1-4 — BLOCKING — undefined graph terms remain in visitor-facing copy

- **Quote/location:** landing art label, “FIG. 01 / RECIPIENT BOUNDARIES”; landing terminal label, “release.yml / recipient diff”; CLI output, “an undeclared recipient”; README, “discovered edges,” “current graph,” “Check the graph,” “Supported adapters,” and “runtime CDN.”
- **Why this fails:** the page teaches **process**, **secret name**, **baseline**, and **supported files**, then switches to undefined implementation terms. F-1-4 required replacement or a definition for any retained term, so the earlier finding was only partly fixed.
- **Concrete fix:** use **process**, **secret name**, **baseline**, and **supported file** in visitor copy and human CLI output. Rewrite the README lines as “List which processes get each secret name,” “Save the current list as the approved baseline,” “Check current access against the baseline in CI,” and “Supported files.” Rewrite “runtime CDN” as “files loaded from another domain.”

### F-3-5 / recurrence of F-1-5 — BLOCKING — README still calls secret names “identifiers”

- **Quote/location:** README, “`.env` and `.env.*`: declared uppercase identifiers.”
- **Why this fails:** F-1-5 required **secret name** as the single term. “Identifier” remains in user-facing copy and conflicts with the current terminology table and the landing page.
- **Concrete fix:** write “`.env` and `.env.*`: declared uppercase secret names.” Add the README to the terminology regression test.

### F-3-6 — Minor — the non-failing `diff` behavior is an unlisted claim

- **Quote/location:** README, “Use `diff` when you want the same comparison without a failing exit code.”
- **Why this fails:** no `claims.json` entry or tagged test proves the `diff` exit behavior. `check-no-change-exit-zero` covers `check`, not `diff` with additions.
- **Concrete fix:** add a `diff-addition-exit-zero` claim and tagged clean-temp-directory test that asserts the addition is printed and the status is 0.

### F-3-7 — Minor — the detailed dotenv support statement is an unlisted claim

- **Quote/location:** README, “`.env` and `.env.*`: declared uppercase identifiers.”
- **Why this fails:** `adapters` only asserts that the bundled report contains a `dotenv` adapter label. It does not assert the advertised filename matching and uppercase-name behavior.
- **Concrete fix:** after applying F-3-5’s wording, add a tagged dotenv-capability claim that checks `.env`, `.env.*`, valid uppercase names, and ignored invalid names.

### F-3-8 — Minor — the detailed Compose support statement is an unlisted claim

- **Quote/location:** README, “Docker Compose: `environment`, `env_file`, and service `secrets` entries.”
- **Why this fails:** `adapters` does not assert all three advertised Compose forms.
- **Concrete fix:** add a tagged Compose-capability claim that observes all three forms in one temporary fixture, including scalar/list `env_file` and short/long secret syntax.

### F-3-9 — Minor — the detailed GitHub Actions support statement is an unlisted claim

- **Quote/location:** README, “GitHub Actions: `secrets.NAME` references in job or step `env`, plus reusable workflow secret inheritance.”
- **Why this fails:** `adapters` does not assert job env, step env, and reusable-workflow inheritance. The bundled claim sample does not exercise all three.
- **Concrete fix:** add a tagged GitHub Actions capability claim with observable edges for each advertised form.

### F-3-10 — Minor — the detailed Kubernetes support statement is an unlisted claim

- **Quote/location:** README, “Kubernetes: `secretKeyRef`, `envFrom.secretRef`, and mounted secret volumes in Pod templates.”
- **Why this fails:** `adapters` only checks that a Kubernetes adapter label appears, not each advertised input form.
- **Concrete fix:** add a tagged Kubernetes-capability claim that asserts one correct edge for each of the three forms and no ConfigMap edge.

### F-3-11 — Minor — “Specimen 02” is a decorative section label

- **Quote/location:** landing preview eyebrow, “Specimen 02.”
- **Why this fails:** it does not name the section or provide usable information, and the visible page has no corresponding “Specimen 01.”
- **Concrete fix:** replace it with “Sample result” or remove it because the following heading already names the section.

### F-3-12 — Minor — “Field method” is a mood heading

- **Quote/location:** landing workflow eyebrow, “Field method.”
- **Why this fails:** it carries the field-journal visual metaphor rather than naming the content.
- **Concrete fix:** replace it with “How it works” or remove it and keep “Review secret access in three commands.”

### F-3-13 — Minor — “Known terrain” is a metaphor heading

- **Quote/location:** landing support eyebrow, “Known terrain.”
- **Why this fails:** it does not identify supported configuration files without the adjacent heading.
- **Concrete fix:** replace it with “Supported files” or remove it as redundant.

### F-3-14 — Minor — “Outside the fence” is a metaphor heading

- **Quote/location:** landing limits eyebrow, “Outside the fence.”
- **Why this fails:** it does not name product limits out of context.
- **Concrete fix:** replace it with “Limits” or remove it and keep “What it does not do.”

### F-3-15 — Minor — the hero’s generated label is decorative jargon and absent from semantic copy

- **Quote/location:** `site/styles.css`, `.hero-art::before { content: 'FIG. 01 / RECIPIENT BOUNDARIES'; }`.
- **Why this fails:** “recipient boundaries” reintroduces the undefined term from F-1-4, while CSS-generated text is not a usable figure caption for assistive technology.
- **Concrete fix:** remove the label, or add a real `<figcaption>` such as “Secret-name paths to processes” and style that element.

### F-3-16 — Minor — a README transition does not make sense out of context

- **Quote/location:** README, “To work on each half separately:”
- **Why this fails:** “each half” does not name the two things a scanning reader is about to build.
- **Concrete fix:** write “Build and test the CLI and documentation site separately:”

## Copy audit

Method: whitespace-separated word counts. Commands, labels, output fragments, alt text, feedback, and CSS-generated visible text are included because a visitor encounters them. No item exceeds 22 words and no banned marketing adjective appears. Landing buttons **Try it with sample data** and **Copy command** are result-naming verbs. Flags point to findings above.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Secret Injection Diff | 3 | Product label |
| Demo | 1 | Navigation label |
| Install | 1 | Navigation label |
| Privacy | 1 | Navigation label |
| Local configuration audit / v0.1.0 | 5 | Context label |
| Prove which process gets each secret name | 7 | Pass |
| For developers reviewing CI and deploy changes before a new process gets a secret name. | 14 | Pass |
| Try it with sample data | 6 | Result-naming action |
| See the check fail when a new process gets a secret name. | 12 | Pass |
| Runs locally · no network calls | 6 | Listed claim `no-network` |
| Reports secret names · never values | 6 | Listed claim `values-excluded` |
| Free · MIT licensed | 4 | Listed claim `free-mit` |
| A cutaway conservatory shows glowing capsules routed into separate plant rooms. | 11 | Image alternative |
| FIG. 01 / RECIPIENT BOUNDARIES | 6 | Decorative jargon — F-3-15 / F-1-4 |
| Specimen 02 | 2 | Decorative label — F-3-11 |
| See which process gets a secret name before merge | 9 | Pass |
| The check compares current secret access with a committed baseline. | 10 | Listed claim `scope-change` |
| release.yml / recipient diff | 4 | Undefined term — F-3-4 / F-1-4 |
| `$ secret-injection-diff check . --baseline baseline.json` | 6 | Sample command |
| `+ NPM_TOKEN -> github:job/verify/step/Publish package [env:NPM_TOKEN]` | 6 | Sample output |
| 1 added, 0 removed | 4 | Sample output |
| check failed: an undeclared recipient gained a secret name | 9 | Undefined term and misleading in F-3-1/F-3-4 |
| exit 2 | 2 | Listed claim `scope-change` |
| Field method | 2 | Mood label — F-3-12 |
| Review secret access in three commands | 6 | Pass |
| The baseline stays in your repository beside the configuration it describes. | 11 | Pass |
| Scan configuration | 2 | Heading |
| Read secret names from supported files and list each process that receives them. | 13 | Listed claim `adapters` |
| Commit the baseline | 3 | Heading |
| Review the JSON list once, then approve it with the pull request. | 12 | Pass |
| Check every change | 3 | Heading |
| Exit code 2 stops CI when a new process gets a secret name. | 13 | Contradicted by F-3-1 |
| Known terrain | 2 | Metaphor label — F-3-13 |
| Supported files and limits | 4 | Heading |
| .env and .env.* | 3 | File label |
| Docker Compose | 2 | File label |
| GitHub Actions | 2 | File label |
| Kubernetes workloads | 2 | File label |
| Outside the fence | 3 | Metaphor label — F-3-14 |
| What it does not do | 5 | Heading |
| It does not read secret stores. | 6 | Listed claim `explicit-adapter-limits` |
| It does not decrypt values. | 5 | Listed claim `no-decryption-storage` |
| It does not watch running processes. | 6 | Listed claim `explicit-adapter-limits` |
| It does not guess vendor behavior. | 6 | Listed claim `explicit-adapter-limits` |
| Start with your repository | 4 | Useful context label |
| Install the local CLI | 4 | Heading |
| `cargo install --git https://github.com/B-Divyesh/sf-secret-injection-diff` | 4 | Install command |
| Copy command | 2 | Result-naming action |
| Install command copied. | 3 | Success feedback |
| Copy failed. Select the command and copy it. | 8 | Error and recovery |
| Then run `secret-injection-diff scan .` | 5 | Instruction |
| Map secret names to processes before merge. | 7 | Product summary |
| v0.1.0 · build 2026-08-28 | 4 | Build label |
| Terms | 1 | Footer link |
| Built by Param Factory (external) | 5 | Attribution link |

### README

Shell commands in fenced code blocks are instructions rather than sentences; all prose, headings, and list sentences are below.

| Copy | Words | Result |
| --- | ---: | --- |
| Secret Injection Diff | 3 | Heading |
| Prove which processes gain secret names before a pull request merges. | 11 | Pass |
| This local CLI is for developers reviewing secret access across `.env`, Docker Compose, GitHub Actions, and Kubernetes files. | 18 | Listed claim `adapters` |
| It records which processes get secret names, compares them with an approved baseline, and returns exit code `2` when access expands. | 20 | Listed claim `scope-change`, contradicted at the promised boundary by F-3-1 |
| The scanner does not decrypt or store secret values. | 9 | Listed claim `no-decryption-storage` |
| Reports contain secret names, process names, and injection paths. | 9 | Listed claim `json-output` |
| Use `--redact` before sharing a report. | 6 | Listed claim `redaction` |
| Try the isolated demo | 4 | Heading |
| The command copies the shipped sample project into a new temporary directory. | 12 | Listed claim `isolated-demo` |
| It compares an approved workflow with a changed workflow and prints where the temporary report lives. | 16 | Listed claim `isolated-demo` |
| It never reads or writes project data. | 7 | Listed claim `isolated-demo` |
| The browser recording is at `https://secret-injection-diff.sociobot.in/demo/?demo=1`. | 6 | Demo URL |
| It uses bundled text and makes no third-party requests. | 9 | Listed claim `no-network` |
| Install | 1 | Heading |
| Run `npm run build` to package the release binary and build the documentation site. | 13 | Listed claim `build-artifacts` |
| Use | 1 | Heading |
| Start by reviewing the discovered edges: | 6 | Undefined jargon — F-3-4 / F-1-4 |
| Approve the current graph: | 4 | Undefined jargon — F-3-4 / F-1-4 |
| Check the graph in CI: | 5 | Undefined jargon — F-3-4 / F-1-4 |
| Exit code `0` means no process gained a secret name. | 10 | Listed claim `check-no-change-exit-zero` |
| Exit code `2` means at least one undeclared process gained one. | 10 | Listed claim `scope-change`, contradicted by F-3-1 |
| Invalid input uses exit code `1`. | 6 | Listed claim `invalid-input-exit-one` |
| Use `diff` when you want the same comparison without a failing exit code. | 13 | Unlisted claim — F-3-6 |
| Supported adapters | 2 | Undefined jargon — F-3-4 / F-1-4 |
| `.env` and `.env.*`: declared uppercase identifiers. | 6 | Inconsistent term and unlisted detail — F-3-5/F-3-7 |
| Values are discarded and never printed. | 6 | Listed claim `values-excluded` |
| Docker Compose: `environment`, `env_file`, and service `secrets` entries. | 8 | Unlisted detail — F-3-8 |
| GitHub Actions: `secrets.NAME` references in job or step `env`, plus reusable workflow secret inheritance. | 14 | Unlisted detail — F-3-9 |
| Kubernetes: `secretKeyRef`, `envFrom.secretRef`, and mounted secret volumes in Pod templates. | 10 | Unlisted detail — F-3-10 |
| The CLI does not guess the behavior of Vault, SOPS, Doppler, 1Password, or cloud secret managers. | 16 | Listed claim `explicit-adapter-limits` |
| Add an explicit adapter before relying on those sources. | 9 | Undefined jargon — F-3-4 / F-1-4 |
| Develop and verify | 3 | Heading |
| The site build lands in `dist/site`. | 6 | Listed claim `build-artifacts` |
| The release CLI lands in `dist/bin`. | 6 | Listed claim `build-artifacts` |
| To work on each half separately: | 6 | Vague fragment — F-3-16 |
| The project has no telemetry, runtime CDN, or paid service. | 10 | Listed by `no-network` and `free-mit`; “runtime CDN” is jargon — F-3-4 |
| See privacy and terms. | 4 | Link instruction |
| License | 1 | Heading |
| MIT | 1 | License label |

## Demo and sandbox verification

- One click on **Try it with sample data** reached `/demo/?demo=1` in a fresh mobile context.
- The loaded page already contained the realistic `NPM_TOKEN` addition, recipient, count, and exit 2. F-3-2 remains because the terminal content itself starts below the first mobile viewport.
- **Replay recorded check** reproduced the transcript. **Reset demo** restored the complete transcript after the next event-loop tick and announced “Demo reset. Sample data is ready.”
- The banner and both required controls exist, but F-3-3 confirms that they scroll out of view.
- The entire browser flow requested only `https://secret-injection-diff.sociobot.in`. Cookies, localStorage, sessionStorage, IndexedDB, Cache Storage, and service-worker registrations remained empty. There is no offline-use claim.
- `cargo run --quiet -- demo` and `cargo run --quiet -- demo --json` in the clean clone created a new `/tmp/secret-injection-diff-demo-*` workspace, reported the one `NPM_TOKEN` addition, and left the clone unchanged.

## Claims verification

A fresh clone at `/tmp/secret-injection-diff-review3-clean` resolved to the candidate commit and received a fresh `npm ci`. Every exact command from `.factory/claims.json` was run separately. Each selected one tagged test and passed.

| Claim | Result |
| --- | --- |
| `adapters` | Pass |
| `scope-change` | Pass; insufficient negative boundary exposed by F-3-1 |
| `check-no-change-exit-zero` | Pass |
| `invalid-input-exit-one` | Pass |
| `values-excluded` | Pass |
| `redaction` | Pass |
| `isolated-demo` | Pass |
| `json-output` | Pass |
| `no-network` | Pass |
| `free-mit` | Pass |
| `no-decryption-storage` | Pass |
| `snapshot-only-write` | Pass |
| `site-data-free` | Pass |
| `build-artifacts` | Pass |
| `explicit-adapter-limits` | Pass |

F-3-6 through F-3-10 are the unlisted claim findings. No registered command failed.

## Earlier findings checked again

Every earlier `review-*.md`, `polish-*.md`, and the handoff were read. The live site and current code were checked rather than relying on the recorded closure status.

| Earlier finding | Current result |
| --- | --- |
| F-1-1 browser storage contradiction | Fixed: live demo has zero web-storage entries, Cache Storage keys, and service-worker registrations. |
| F-1-2 incomplete 404 metadata | Fixed: 404 has canonical, description, OG/Twitter, favicon, and Apple icon metadata. |
| F-1-3 route focus | Fixed: Home → Demo, Back, and Demo → Install focus and announce the destination headings. |
| F-1-4 undefined graph jargon | **Still partly open:** `recipient`, `edges`, `graph`, and `adapters` remain without a definition. Reopened as F-3-4/F-1-4. |
| F-1-5 inconsistent secret-name terminology | **Still partly open:** README retains “identifiers.” Reopened as F-3-5/F-1-5. |
| F-1-6 untested Rust version | Fixed: the numeric compiler promise remains absent. |
| F-1-7 build-output promises | Fixed: `build-artifacts` passed and produced both paths. |
| F-1-8 partial exit-code coverage | Fixed for documented `check` statuses: exit 0, 1, and 2 claims pass. F-3-6 separately covers unregistered `diff` behavior. |
| F-2-1 normal route/Back focus | Fixed live and in route tests. |
| F-2-2 hero overclaim/inconsistent credential wording | Fixed on the hero: it consistently says “secret name.” F-3-5 is the remaining README recurrence of F-1-5. |
| F-2-3 metaphorical 404 heading | Fixed: the heading is “Page not found.” |

The earlier parser defects for ConfigMaps, reordered Kubernetes mappings, scalar Compose `env_file`, long Compose secrets, and GitHub matrices remain covered by passing regressions. F-3-1 is a separate comparison-boundary defect.

## Structure, routes, accessibility, and links

- `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/404.html` each have one `<h1>`, one `<main>`, `lang="en"`, route-appropriate titles, descriptions, canonicals, OG/Twitter metadata, favicon, Apple icon, header, and footer.
- The title patterns are “Product — what it does” on home and “Route — Product” elsewhere. The unknown route returns the designed page with HTTP 404; `/404.html` itself returns 200.
- All product navigation links, `https://sociobot.in`, and the GitHub issue tracker returned 200. The unknown-route document correctly remained HTTP 404. No dead link was found.
- Normal navigation, Back, and the demo-to-install deep link focus and announce their destination headings. Direct routes and hash targets load correctly.
- Axe 4.10.2 found zero serious or critical violations on all five pages at both viewports after styles loaded. There was no horizontal overflow. Mobile interactive controls have 44 px minimum heights. Reduced-motion rules are present.
- `/opt/fleet/lib/verify-url.sh` passed the live root with HTTP 200, title/lang/main/h1/alt checks, and no console errors.
- The conservatory illustration, clipped paper geometry, editorial type, restrained terminal ledger, and palette match `.factory/design.md`. The result is visually distinct from a generic SaaS template.

## Missed leverage

No AI step is justified for a deterministic local configuration parser. JSON output, baseline import through a committed file, and CI-oriented exit statuses already cover the obvious export and automation needs. No provider key or runtime AI call is present. No additional missed-leverage finding is raised.

## Local verification

- All 15 exact registered claim commands: pass in the clean clone.
- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm run build`: pass through the `build-artifacts` claim and produced `dist/site` plus `dist/bin/secret-injection-diff`.
- Corrected live Axe sweep: zero serious/critical findings on five routes at two viewports.

## What would make this perfect

Make the CI gate compare the promised secret-name/process boundary, put real CLI output inside the first mobile demo viewport, keep the demo banner visible, finish the earlier plain-language terminology repair, replace decorative field-journal labels with informative section names, and register an observable test for every detailed README capability. Then repeat the full clean-clone and cold-live review. PASS requires zero findings.
