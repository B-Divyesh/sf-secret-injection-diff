# Adversarial first-read review 7 — Secret Injection Diff

- Reviewed: 2026-08-29 UTC
- Live target: <https://secret-injection-diff.sociobot.in>
- Candidate: `7a3f96cd943fe3a78083827fa90d8f111b12c7a1`
- Viewports: fresh Chromium contexts at 390 × 844 and 1440 × 900
- Verdict: **PASS**

No finding remains. The deployed product is clear on first read, immediately
tryable with isolated sample data, and its testable statements are all covered
by passing sandbox checks.

## Cold first read

I opened the live root in separate fresh browser contexts and recorded these
answers before scrolling.

| Question | First-read answer | Exact first-screen evidence |
| --- | --- | --- |
| What does this do? | It checks configuration to show which process gets each secret name. | “Check which process gets each secret name” |
| For whom? | Developers reviewing CI and deployment changes before an added process gets a secret name. | “For developers reviewing CI and deploy changes before a new process gets a secret name.” |
| What should I click first? | **Try it with sample data**. | The primary action is visible and says “See the check fail when a new process gets a secret name.” |

The mobile first screen contains the primary action and all three facts. The
desktop first screen presents the same job, audience, action, and result beside
the original conservatory illustration. There were no console errors or
horizontal overflow.

## Findings

None.

## Copy audit

Method: whitespace-separated words. Code in fenced README blocks is excluded;
all visitor-facing sentences, headings, labels, feedback, image alternative,
and terminal fragments are included. No item exceeds 22 words. No banned
marketing adjective, undefined graph term, metaphor heading, inconsistent core
term, or non-result button was found. Every claim-like statement maps to the
claim inventory.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Skip to content | 3 | Clear action |
| Secret Injection Diff | 3 | Product label |
| Demo | 1 | Navigation label |
| Install | 1 | Navigation label |
| Privacy | 1 | Navigation label |
| Local configuration audit / v0.1.0 | 5 | Context label |
| Check which process gets each secret name | 7 | Plain job headline |
| For developers reviewing CI and deploy changes before a new process gets a secret name. | 14 | Audience and situation |
| Try it with sample data | 5 | Result-naming action |
| See the check fail when a new process gets a secret name. | 12 | States result after clicking |
| Runs locally · no network calls | 6 | Listed `no-network` claim |
| Reports secret names · never values | 6 | Listed `values-excluded` claim |
| Free · MIT licensed | 4 | Listed `free-mit` claim |
| A cutaway conservatory shows glowing capsules routed into separate plant rooms. | 11 | Purposeful image alternative |
| Secret names mapped to processes | 5 | Figure caption |
| Sample result | 2 | Section label |
| See which process gets a secret name before code merges | 10 | Specific heading |
| The check compares current secret access with a committed baseline. | 10 | Listed `scope-change` claim |
| release.yml / process access | 4 | Output label |
| 1 process added, 0 removed; 0 delivery methods changed | 9 | Sample output |
| check failed: an unapproved process gained a secret name | 9 | Listed `scope-change` claim |
| exit 2 | 2 | Listed `scope-change` claim |
| Scroll sideways to read the full command and process path. | 10 | Responsive instruction |
| How it works | 3 | Section label |
| Review secret access in three commands | 6 | Specific heading |
| Save the baseline in your repository beside the configuration it describes. | 11 | Concrete instruction |
| Scan configuration | 2 | Step heading |
| Read secret names from supported files. | 6 | Listed adapter claims |
| List processes only when a supported file names them. | 9 | Listed `dotenv-capability` boundary |
| Commit the baseline | 3 | Step heading |
| Review the JSON list once, then approve it with the pull request. | 12 | Concrete instruction |
| Check every change | 3 | Step heading |
| Exit code 2 stops CI when a new process gets a secret name. | 13 | Listed `scope-change` claim |
| Supported files | 2 | Section label |
| Supported files and limits | 4 | Specific heading |
| .env and .env.* | 3 | File-type label |
| Docker Compose | 2 | File-type label |
| GitHub Actions | 2 | File-type label |
| Kubernetes workloads | 2 | File-type label |
| Limits | 1 | Section label |
| What it does not do | 5 | Specific heading |
| It does not read secret stores. | 6 | Listed `explicit-adapter-limits` claim |
| It does not decrypt values. | 5 | Listed `no-decryption-storage` claim |
| It does not watch running processes. | 6 | Listed `explicit-adapter-limits` claim |
| It does not guess vendor behavior. | 6 | Listed `explicit-adapter-limits` claim |
| Start with your repository | 4 | Section context |
| Install the local CLI | 4 | Specific heading |
| Copy command | 2 | Result-naming button |
| Install command copied. | 3 | Success feedback |
| Copy failed. | 2 | Error |
| Select the command and copy it. | 6 | Recovery action |
| Then run secret-injection-diff scan . | 4 | Concrete next step |
| Map secret names to processes before code merges. | 8 | Product summary |
| v0.1.0 · build 2026-08-29 | 4 | Build label |
| Terms | 1 | Navigation label |
| Built by Param Factory (external) | 5 | Attribution and destination type |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Secret Injection Diff | 3 | Product heading |
| Prove which processes gain secret names before a pull request merges. | 11 | Plain job statement |
| This local CLI is for developers reviewing secret access across `.env`, Docker Compose, GitHub Actions, and Kubernetes files. | 18 | Listed adapter claims |
| It records which named processes get secret names and compares them with an approved baseline. | 15 | Listed `adapters` and `scope-change` claims |
| It returns exit code `2` when a new process gets a secret name. | 13 | Listed `scope-change` claim |
| The scanner does not decrypt or store secret values. | 9 | Listed `no-decryption-storage` claim |
| Reports contain secret names, process names, and delivery methods, such as an environment variable or mounted file. | 17 | Listed `json-output` claim |
| Use `--redact` before sharing a report. | 6 | Listed `redaction` claim |
| It uses opaque labels that match only within that output. | 10 | Listed `redaction` claim |
| Try the isolated demo | 4 | Specific heading |
| The command copies the shipped sample project into a new temporary directory. | 12 | Listed `isolated-demo` claim |
| It compares an approved workflow with a changed workflow, prints the result, and shows the temporary workspace path. | 18 | Listed `isolated-demo` claim |
| It does not read or write the project where you run the command. | 13 | Listed `isolated-demo` claim |
| The browser recording is at https://secret-injection-diff.sociobot.in/demo/?demo=1. | 6 | Working demo URL |
| It uses bundled text and makes no third-party requests. | 9 | Listed `no-network` claim |
| Install | 1 | Specific heading |
| Run `npm run build` to package the release binary and build the documentation site. | 14 | Listed `build-artifacts` claim |
| Use the CLI | 3 | Specific heading |
| List which processes get each secret name: | 7 | Concrete instruction |
| Save the current list as the approved baseline: | 8 | Concrete instruction |
| Check current access against the baseline in CI: | 8 | Concrete instruction |
| Exit code `0` means no process gained a secret name. | 10 | Listed `check-no-change-exit-zero` claim |
| Exit code `2` means at least one new process gained a secret name. | 13 | Listed `scope-change` claim |
| Invalid input uses exit code `1`. | 6 | Listed `invalid-input-exit-one` claim |
| Changing only the delivery method for the same secret name and process is reported, but the check still returns exit code `0`. | 22 | Listed `same-recipient-injection-change-exit-zero` claim |
| Use `diff` when you want the same comparison without a failing exit code. | 13 | Listed `diff-addition-exit-zero` claim |
| Supported files | 2 | Specific heading |
| `.env` and `.env.*`: declared uppercase secret names. | 7 | Listed `dotenv-capability` claim |
| They do not count as process access until a Compose `env_file` entry binds them. | 14 | Listed `dotenv-capability` claim |
| Values are discarded and never printed. | 6 | Listed `values-excluded` claim |
| Docker Compose: `environment`, `env_file`, and service `secrets` entries. | 8 | Listed `compose-capability` claim |
| GitHub Actions: `secrets.NAME` references in job or step `env`, plus reusable workflow secret inheritance. | 14 | Listed `github-actions-capability` claim |
| Kubernetes: `secretKeyRef`, `envFrom.secretRef`, and mounted secret volumes in Pod templates. | 10 | Listed `kubernetes-capability` claim |
| The CLI does not guess the behavior of Vault, SOPS, Doppler, 1Password, or cloud secret managers. | 16 | Listed `explicit-adapter-limits` claim |
| Add support for those sources before relying on them. | 9 | Concrete limitation instruction |
| Develop and verify | 3 | Specific heading |
| The site build lands in `dist/site`. | 6 | Listed `build-artifacts` claim |
| The release CLI lands in `dist/bin`. | 6 | Listed `build-artifacts` claim |
| Deploy the contents of `dist/site` to a static host. | 9 | Concrete instruction |
| The factory handles production deployment; this repository does not manage infrastructure. | 11 | Repository scope |
| Build and test the CLI and documentation site separately: | 9 | Concrete instruction |
| The project has no telemetry or paid service. | 8 | Listed `no-network` and `free-mit` claims |
| The website loads no files from another domain. | 8 | Listed `no-network` claim |
| See privacy and terms. | 4 | Clear link instruction |
| License | 1 | Specific heading |
| MIT | 1 | Listed `free-mit` claim |

The terminology is consistent: **secret name**, **process**, **declaration**,
**delivery method**, **baseline**, **file type**, and **demo** each carry one
meaning.

## Demo and sandbox verification

- One click on **Try it with sample data** opened `/demo/?demo=1`.
- At 390 × 844, the first demo viewport already showed the real command,
  `NPM_TOKEN` addition, summary, failure text, and `exit 2`.
- The persistent banner says “Demo — sample data, nothing is saved.” **Reset
  demo** restored the transcript and announced “Demo reset. Sample data is
  ready”; **Start for real** remains available after a mobile bottom scroll.
- A fresh context after the demo had empty cookies, localStorage,
  sessionStorage, IndexedDB, Cache Storage, and service-worker registrations.
  The request log contained only `https://secret-injection-diff.sociobot.in`.
- `cargo run --manifest-path /work/repo/Cargo.toml -- demo`, invoked with an
  empty temporary caller directory, created
  `/tmp/secret-injection-diff-demo-5587-1787964259258`. The caller retained
  only its unchanged sentinel and output capture; the CLI printed the expected
  NPM_TOKEN addition and baseline path.

There is no offline claim. Demo mode is the bundled, memory-only recording and
does not access real browser or project data.

## Claims verification

In fresh clone `/tmp/sid-review7-clean`, after `npm ci`, every exact command
listed in `.factory/claims.json` completed successfully and selected its one
tagged test:

`adapters`, `dotenv-capability`, `compose-capability`,
`github-actions-capability`, `kubernetes-capability`, `scope-change`,
`same-recipient-injection-change-exit-zero`, `check-no-change-exit-zero`,
`diff-addition-exit-zero`, `invalid-input-exit-one`, `values-excluded`,
`redaction`, `isolated-demo`, `json-output`, `no-network`, `free-mit`,
`no-decryption-storage`, `snapshot-only-write`, `site-data-free`,
`build-artifacts`, and `explicit-adapter-limits`.

The `no-network` browser assertion was independently confirmed from the live
fresh-context request log above. Landing, demo, privacy, terms, and README
copy were then checked against the inventory; no unlisted claim-like sentence
was found.

## Earlier findings rechecked

Every prior `review-*.md`, `polish-*.md`, verification record, and handoff was
read. Each earlier finding was confirmed fixed on the live site and in the
current source/tests.

| Finding | Current confirmation |
| --- | --- |
| F-1-1 | No service worker, Cache Storage, cookie, or browser storage is created. |
| F-1-2 | The 404 has canonical, OG/Twitter, favicon, and Apple-touch metadata. |
| F-1-3 | Normal navigation, `/#install`, and Back focus and announce their destination. |
| F-1-4 | Visitor and human CLI copy use process/access language, not graph jargon. |
| F-1-5 | Visitor copy consistently says “secret name.” |
| F-1-6 | No numeric Rust-version promise remains. |
| F-1-7 | The documented artifacts are produced and covered by `build-artifacts`. |
| F-1-8 | Exit statuses 0, 1, and 2 are each covered by observable claims. |
| F-2-1 | Full-page navigation and Back focus and announce the destination h1. |
| F-2-2 | The hero promises observable secret-name access, not credentials. |
| F-2-3 | The error h1 is the plain “Page not found.” |
| F-3-1 | Delivery-method-only changes are reported without exit 2. |
| F-3-2 | The mobile demo's command, result, and exit status are in the first viewport. |
| F-3-3 | The sticky demo banner and both controls remain visible while scrolling. |
| F-3-4 | Undefined graph terms remain absent from visitor and CLI copy. |
| F-3-5 | README uses “secret names,” not “identifiers.” |
| F-3-6 | The non-failing `diff` addition behavior is a passing claim. |
| F-3-7 | Dotenv declaration/binding behavior is a passing claim. |
| F-3-8 | All documented Compose forms are a passing claim. |
| F-3-9 | Documented GitHub Actions forms are a passing claim. |
| F-3-10 | Documented Kubernetes forms and ConfigMap exclusions are a passing claim. |
| F-3-11 | “Specimen 02” was replaced by “Sample result.” |
| F-3-12 | “Field method” was replaced by “How it works.” |
| F-3-13 | “Known terrain” was replaced by “Supported files.” |
| F-3-14 | “Outside the fence” was replaced by “Limits.” |
| F-3-15 | The visual relationship has a semantic process-mapping caption. |
| F-3-16 | The README transition explicitly names the CLI and documentation site. |
| F-4-1 | Standalone dotenv entries are declarations until a supported binding names a process. |
| F-4-2 | Redaction uses unique opaque labels and never prints the raw secret name. |
| F-4-3 | CLI network behavior is observed through syscall recording. |
| F-4-4 | All three mobile fact rows finish above the initial fold. |
| F-4-5 | A visible sideways-scroll instruction appears when terminal output clips. |
| F-4-6 | Baseline-location wording is an instruction, not an unenforced promise. |
| F-4-7 | README accurately describes a result and workspace path, not a report file. |
| F-4-8 | Demo isolation is correctly scoped to the caller's project. |
| F-4-9 | Visitor and human output use the defined “delivery methods” term. |
| F-4-10 | The sample-result heading now says “before code merges.” |
| F-4-11 | The README heading is “Use the CLI.” |
| F-5-1 | The untestable future Terms-change promise and empty Changes section are absent. |
| F-6-1 | Build-artifact validation runs before Playwright; the browser suite does not rebuild the served directory. |

## Structure, accessibility, links, and visual identity

- `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/404.html` returned 200;
  `/not-a-route` returned the designed 404 with HTTP 404. Every route has one
  h1 and main, `lang="en"`, a title, description, canonical, OG/Twitter card,
  favicon, Apple icon, consistent header, and footer legal links.
- Titles follow the required home and route patterns. Direct URLs, reloads,
  focus handoff, and Back work. `robots.txt`, `sitemap.xml`, and security
  headers are present.
- All local links and the two external links (`sociobot.in` and the GitHub
  issue tracker) returned 200. No dead link was found.
- The clean-clone aggregate gate passed: `npm test` reported 9 Rust and 58
  Playwright tests. `npm run lint`, `npm run typecheck`, and `npm run build`
  also passed. The production build emitted `dist/site` and `dist/bin`; its
  JavaScript is 1.40 kB gzip and CSS is 2.94 kB gzip.
- Fresh live mobile and desktop loads had no console errors. The product uses
  the documented conservatory art, editorial serif/monospace pairing, clipped
  paper geometry, acid/coral/ice palette, and restrained terminal ledger. It
  is distinct from a generic SaaS template.

## Missed leverage

No missing AI, import/export, or sync feature is implied by the brief. This
deterministic, local configuration parser already has JSON output, baseline
input, redaction, and CI exit statuses. An AI step would add privacy and cost
risk without improving the access decision. No decorative AI or provider key
exists.

## What would make this perfect

The product meets this checklist with no remaining action. Preserve the
existing isolated-demo, no-network, and serial build-preflight checks when
changing the parser or documentation, then repeat this full fresh-context and
clean-clone audit.
