# Adversarial first-read review 2 — Secret Injection Diff

- Reviewed: 2026-08-28 UTC
- Live target: <https://secret-injection-diff.sociobot.in>
- Viewports: fresh Chromium contexts at 390 × 844 and 1440 × 900
- Verdict: **FAIL**

The product is tryable and every registered claim passes. The verdict is FAIL because two prior repairs are incomplete under the stated route-focus and consistent-terms requirements, and one plain-language 404 issue remains.

## Cold first read

Before scrolling, both fresh contexts made the job, audience, and first action clear.

| Question | First-read answer | Exact visible copy |
| --- | --- | --- |
| What does it do? | Checks configuration changes for a process getting a secret. | “Prove which process gets each secret” |
| For whom? | Developers reviewing CI and deployment changes. | “For developers reviewing CI and deploy changes…” |
| What should I click first? | **Try it with sample data**. | Primary action at y=567 on 390 px and y=698 on desktop |

This gate passes. There was no initial-page console error or horizontal overflow at either viewport.

## Findings

### F-2-1 / recurrence of F-1-3 — BLOCKING — normal route changes do not move focus or announce the destination

- **Quote/location:** header link “Demo” on the live home page; `site/main.js` calls `focusDestination()` only for hash targets.
- **Evidence:** from `/`, focusing **Demo** with the keyboard and pressing Enter reached `/demo/`. `document.activeElement` was `BODY` and `[data-route-status]` was empty. Browser Back returned to `/` with focus again on `BODY` and no announcement. The repaired **Start for real** hash route does focus `#install-heading`, so the behavior is only partially repaired.
- **Why this fails:** keyboard and screen-reader users receive neither the new-page heading nor an announcement after ordinary navigation or Back. This directly fails the route-focus check and leaves F-1-3 half fixed.
- **Concrete fix:** on every full-page route load and `pageshow` from Back/Forward, focus that page’s `<h1>` (with `tabindex="-1"`) and set the polite route status to the heading text. Retain the hash behavior. Add Playwright coverage for Home → Demo via keyboard and Back, asserting heading focus and live-region text.

### F-2-2 / recurrence of F-1-5 — BLOCKING — the hero promises a credential while the product proves only secret names

- **Quote/location:** landing lede, “For developers reviewing CI and deploy changes before an unexpected process gains a **credential**.” The same first screen says “Prove which process gets each **secret**” and “Reports **names** · never values.”
- **Evidence:** the brief, the copy-audit terminology table, privacy page, and CLI output define the observable unit as a **secret name**. The `values-excluded` and `no-decryption-storage` claims confirm that values are not read or reported. A declared name-to-process relationship cannot prove that a process received a credential at runtime.
- **Why this fails:** the hero shifts among *secret*, *credential*, and unqualified *names* for the core object. “Gains a credential” reads as a broader runtime/value claim than the CLI can honestly establish. This leaves the earlier single-term repair incomplete on the most important screen.
- **Concrete fix:** replace the lede with “For developers reviewing CI and deploy changes before a new process gets a secret name.” Replace the fact with “Reports secret names · never values.” Update the terminology/copy test to reject visitor-facing `credential` and bare `names` when they mean a secret name.

### F-2-3 — Minor — the 404 headline is an undefined product pun

- **Quote/location:** live unknown route and `site/404.html` `<h1>`, “This route has no recipient”.
- **Evidence:** `https://secret-injection-diff.sociobot.in/route-that-does-not-exist` correctly returns HTTP 404, but its only headline assumes that a visitor knows the product’s graph term *recipient*. A URL route cannot literally receive a secret.
- **Why this fails:** headings must make sense out of context. A visitor following a broken link needs a direct not-found explanation, not a graph metaphor.
- **Concrete fix:** change the heading to “Page not found” and retain the existing lede and **Return home** action. Add the exact 404 `<h1>` to the copy audit.

## Copy audit

Method: whitespace-separated word counts. Headings, labels, buttons, feedback, and visible output fragments are included because visitors read them; code-only commands are excluded. No landing or README sentence exceeds 22 words. Landing buttons are result-naming verbs: **Try it with sample data** and **Copy command**. The terminology flag is F-2-2.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Secret Injection Diff | 3 | Label |
| Demo; Install; Privacy | 1 each | Navigation labels |
| Local configuration audit / v0.1.0 | 5 | Context label |
| Prove which process gets each secret | 6 | Pass |
| For developers reviewing CI and deploy changes before an unexpected process gains a credential. | 13 | Inconsistent/broader core term — F-2-2 |
| Try it with sample data | 6 | Result-naming verb |
| See the check fail when a new process gets a secret. | 11 | Pass |
| Runs locally · no network calls | 6 | Listed claim `no-network` |
| Reports names · never values | 5 | Ambiguous core term — F-2-2 |
| Free · MIT licensed | 4 | Listed claim `free-mit` |
| A cutaway conservatory shows glowing capsules routed into separate plant rooms. | 11 | Image alternative |
| Specimen 02; Field method; Known terrain; Outside the fence; Start with your repository | 2; 2; 2; 3; 4 | Section labels |
| See which process gets a secret before merge | 8 | Pass |
| The check compares current secret access with a committed baseline. | 10 | Pass |
| release.yml / recipient diff; 1 added, 0 removed; exit 2 | 4; 4; 2 | Output fragments |
| check failed: an undeclared recipient gained a secret name | 9 | Listed claim `scope-change` |
| Review secret access in three commands | 6 | Pass |
| The baseline stays in your repository beside the configuration it describes. | 11 | Pass |
| Scan configuration; Commit the baseline; Check every change | 2; 3; 3 | Headings |
| Read secret names from supported files and list each process that receives them. | 13 | Listed claim `adapters` |
| Review the JSON list once, then approve it with the pull request. | 12 | Pass |
| Exit code 2 stops CI when a new process gets a secret name. | 13 | Listed claim `scope-change` |
| Supported files and limits; What it does not do; Install the local CLI | 4; 5; 4 | Headings |
| .env and .env.*; Docker Compose; GitHub Actions; Kubernetes workloads | 3; 2; 2; 2 | File-type labels |
| It does not read secret stores. | 6 | Listed claim `explicit-adapter-limits` |
| It does not decrypt values. | 5 | Listed claim `no-decryption-storage` |
| It does not watch running processes. | 6 | Listed claim `explicit-adapter-limits` |
| It does not guess vendor behavior. | 6 | Listed claim `explicit-adapter-limits` |
| Copy command | 2 | Result-naming verb |
| Install command copied. | 3 | Feedback |
| Copy failed. Select the command and copy it. | 8 | Error and recovery |
| Then run secret-injection-diff scan. | 4 | Pass |
| Map secret recipients before merge. | 5 | Pass |
| v0.1.0 · build 2026-08-28; Terms; Built by Param Factory | 4; 1; 4 | Footer |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Secret Injection Diff | 3 | Heading |
| Prove which processes gain secret names before a pull request merges. | 11 | Pass |
| This local CLI is for developers reviewing secret access across `.env`, Docker Compose, GitHub Actions, and Kubernetes files. | 18 | Listed claim `adapters` |
| It records which processes get secret names, compares them with an approved baseline, and returns exit code `2` when access expands. | 20 | Listed claim `scope-change` |
| The scanner does not decrypt or store secret values. | 9 | Listed claim `no-decryption-storage` |
| Reports contain secret names, process names, and injection paths. | 8 | Listed claim `json-output` |
| Use `--redact` before sharing a report. | 6 | Listed claim `redaction` |
| Try the isolated demo; Install; Use; Supported adapters; Develop and verify; License | 4; 1; 1; 2; 3; 1 | Headings |
| The command copies the shipped sample project into a new temporary directory. | 12 | Listed claim `isolated-demo` |
| It compares an approved workflow with a changed workflow and prints where the temporary report lives. | 16 | Listed claim `isolated-demo` |
| It never reads or writes project data. | 7 | Listed claim `isolated-demo` |
| The browser recording is at `https://secret-injection-diff.sociobot.in/demo/?demo=1`. | 6 | Demo URL |
| It uses bundled text and makes no third-party requests. | 9 | Listed claim `no-network` |
| Run `npm run build` to package the release binary and build the documentation site. | 13 | Listed claim `build-artifacts` |
| Start by reviewing the discovered edges. | 6 | Pass |
| Approve the current graph. | 4 | Pass |
| Check the graph in CI. | 5 | Pass |
| Exit code `0` means no process gained a secret name. | 10 | Listed claim `check-no-change-exit-zero` |
| Exit code `2` means at least one undeclared process gained one. | 10 | Listed claim `scope-change` |
| Invalid input uses exit code `1`. | 6 | Listed claim `invalid-input-exit-one` |
| Use `diff` when you want the same comparison without a failing exit code. | 13 | Pass |
| `.env` and `.env.*`: declared uppercase identifiers. | 6 | Supported-adapter detail |
| Values are discarded and never printed. | 6 | Listed claim `values-excluded` |
| Docker Compose: `environment`, `env_file`, and service `secrets` entries. | 8 | Supported-adapter detail |
| GitHub Actions: `secrets.NAME` references in job or step `env`, plus reusable workflow secret inheritance. | 14 | Supported-adapter detail |
| Kubernetes: `secretKeyRef`, `envFrom.secretRef`, and mounted secret volumes in Pod templates. | 10 | Supported-adapter detail |
| The CLI does not guess the behavior of Vault, SOPS, Doppler, 1Password, or cloud secret managers. | 16 | Listed claim `explicit-adapter-limits` |
| Add an explicit adapter before relying on those sources. | 9 | Pass |
| The site build lands in `dist/site`. | 6 | Listed claim `build-artifacts` |
| The release CLI lands in `dist/bin`. | 6 | Listed claim `build-artifacts` |
| To work on each half separately: | 6 | Fragment |
| The project has no telemetry, runtime CDN, or paid service. | 10 | Listed claims `no-network`, `free-mit` |
| See privacy and terms. | 4 | Link instruction |
| MIT | 1 | License label |

## Demo and sandbox verification

- A fresh mobile home page reached `/demo/?demo=1` with one **Try it with sample data** click.
- The first demo screen immediately showed `NPM_TOKEN -> github:job/verify/step/Publish package` and `exit 2`.
- Its persistent banner read “Demo — sample data, nothing is saved,” with working **Reset demo** and **Start for real** controls. Reset announced “Demo reset. Sample data is ready.”
- After every demo interaction, the fresh context had no cookies, localStorage, sessionStorage, IndexedDB, Cache Storage, service-worker registrations, or forms. The request log contained only the product origin.
- `cargo run --quiet -- demo` in the clean clone created `/tmp/secret-injection-diff-demo-4601-1787943998216`, printed its baseline path, and left the clone unchanged. `demo --json` reported the same addition.

There is no offline-use claim. The privacy/no-network claim is confirmed by the request log.

## Claims verification

A fresh clone at `/tmp/secret-injection-diff-review-2-clean` passed `npm ci`. Every exact test command in `.factory/claims.json` was run from that clone. All 15 passed, with exactly one `@claim:<id>` test each: `adapters`, `scope-change`, `check-no-change-exit-zero`, `invalid-input-exit-one`, `values-excluded`, `redaction`, `isolated-demo`, `json-output`, `no-network`, `free-mit`, `no-decryption-storage`, `snapshot-only-write`, `site-data-free`, `build-artifacts`, and `explicit-adapter-limits`.

The live landing, demo, privacy, terms, and README were cross-checked. All reliance statements map to listed claims; no unlisted claim or failed listed test was found.

## Earlier-review and handoff verification

Read in full: `review-1.md`, `polish-1.md`, `verification-2.md`, `verification-3.md`, and the prior `handoff.md`.

| Earlier finding | Live and code result |
| --- | --- |
| F-1-1 service-worker/browser storage | Fixed: zero registrations and Cache Storage keys; `/sw.js` returns 404. |
| F-1-2 incomplete 404 metadata | Fixed: canonical, description, OG/Twitter fields, favicon, and Apple icon exist. |
| F-1-3 focus after navigation | **Partially fixed:** hash route works; normal route/Back focus fails. See F-2-1. |
| F-1-4 graph jargon | Fixed in landing sections. |
| F-1-5 secret-name terminology | **Partially fixed:** hero still says “credential” then “names.” See F-2-2. |
| F-1-6 Rust version promise | Fixed: no numeric compiler-minimum promise remains. |
| F-1-7 build-output promise | Fixed: `build-artifacts` passes and build produces both paths. |
| F-1-8 exit-status promises | Fixed: separate exit 0, 1, and 2 claims pass. |

Previous parser regressions are covered by passing Kubernetes mapping-order/ConfigMap, Compose scalar `env_file`/long-secret, and GitHub matrix-stability tests.

## Structure, accessibility, and links

- `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/404.html` returned 200 and each had one `<h1>`, one `<main>`, `lang="en"`, appropriate title/description/canonical/OG/Twitter metadata, favicon, header, and footer. The unknown route returned the designed page with HTTP 404.
- `robots.txt`, `sitemap.xml`, favicon, Apple icon, social/hero images, internal routes, `https://sociobot.in`, and the GitHub issue link returned 200. No dead links were found.
- Axe 4.10.2 found zero serious or critical issues on all five pages at 390 × 844 and 1440 × 900. Reduced motion and 44 px controls are present. F-2-1 remains because only the special hash route handles focus/announcement.
- The original conservatory/editorial identity matches `.factory/design.md` and is not a generic SaaS template.
- No AI step is implied by this deterministic local parser; CI JSON output is present and no provider key is embedded.

## Local verification

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

All commands passed. `npm test` passed 8 Rust tests and 40 Playwright tests; the build produced `dist/site` and `dist/bin/secret-injection-diff`.

## What would make this perfect

Make all route changes and Back focus and announce the destination heading; use **secret name** consistently in the hero; and replace the 404 recipient pun with “Page not found.” Then repeat this full cold-context, clean-clone review. PASS requires zero findings.
