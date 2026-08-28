# Claim verification — 2026-08-28

All claim tests ran from the bundled sample and a fresh browser context.

| Claim | Result | Evidence |
| --- | --- | --- |
| `adapters` | Pass | JSON contained `dotenv`, `compose`, `github-actions`, and `kubernetes` edges. |
| `scope-change` | Pass | A temp-dir baseline returned exit code 2 and one added publish-step edge. |
| `values-excluded` | Pass | Known fake `.env` values were absent from JSON; `DATABASE_URL` remained. |
| `redaction` | Pass | Two runs returned the same hash and omitted `NPM_TOKEN`. |
| `isolated-demo` | Pass | The workspace was below the operating system temp directory, outside the repository. |
| `json-output` | Pass | Output parsed as schema 1 with all required edge fields. |
| `no-network` | Pass | The CLI has no network dependency; browser capture contained only the served origin. |
| `free-mit` | Pass | The MIT license exists and the site exposes no payment action. |

Command: `npm test` — 5 Rust tests and 16 Playwright tests passed.

Focused verifier command: `npm test -- --grep @claim:scope-change` — 1 matching claim test passed.
