# Claim verification — 2026-08-28 perfection-loop round 3

Every command in `.factory/claims.json` was run separately after `npm ci` in clean clone `/tmp/sid-polish3-final-V9flcC/repo` at commit `231865cd7d89c332fb854cef5913c51f2613ce2f`. All 21 commands selected exactly one tagged test and passed.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `adapters` | Pass | Bundled output contains dotenv, Compose, GitHub Actions, and Kubernetes results. |
| `dotenv-capability` | Pass | `.env`, `.env.local`, and `.env.production` yield uppercase secret names; lowercase, invalid, and unrelated-file names are absent. |
| `compose-capability` | Pass | One temporary project yields environment, scalar/list `env_file`, and short/long service-secret results. |
| `github-actions-capability` | Pass | A temporary workflow yields job env, step env, and reusable-workflow inheritance results. |
| `kubernetes-capability` | Pass | A temporary Deployment yields `secretKeyRef`, `envFrom.secretRef`, and mounted-volume results while excluding ConfigMaps. |
| `scope-change` | Pass | A new `NPM_TOKEN` process returns exit code 2; the same test proves an injection-only refactor does not. |
| `same-recipient-injection-change-exit-zero` | Pass | Compose environment-to-secret-mount change prints one injection-path change and exits 0. |
| `check-no-change-exit-zero` | Pass | A sample checked against its own baseline returns exit code 0. |
| `diff-addition-exit-zero` | Pass | `diff` prints the new publish process and returns exit code 0. |
| `invalid-input-exit-one` | Pass | A missing path returns exit code 1 with an actionable error. |
| `values-excluded` | Pass | Known fixture values are absent from JSON output while their secret names remain. |
| `redaction` | Pass | Stable hashes replace names in scans and injection-path changes; raw names are absent. |
| `isolated-demo` | Pass | The CLI creates a new system-temp workspace, leaves repository samples unchanged, and its real check output matches the browser transcript. |
| `json-output` | Pass | Output parses with schema 1 and complete access fields. |
| `no-network` | Pass | CLI dependencies contain no network client; browser requests stay on the product origin. |
| `free-mit` | Pass | The MIT license exists and the site has no payment path. |
| `no-decryption-storage` | Pass | A sentinel value is absent from output; its source stays unchanged and no output file appears. |
| `snapshot-only-write` | Pass | Scan/check/diff create no files; snapshot creates only the requested baseline. |
| `site-data-free` | Pass | Five routes create no service workers, Cache Storage, cookies, web storage, forms, accounts, analytics, or third-party requests. |
| `build-artifacts` | Pass | `npm run build` creates non-empty `dist/site/index.html` and `dist/bin/secret-injection-diff`. |
| `explicit-adapter-limits` | Pass | Vault and SOPS-style files produce no results; source has no vendor integration or process watcher. |

The repository test `every registered claim has exactly one tagged test` also verifies unique IDs and exact command/tag correspondence.
