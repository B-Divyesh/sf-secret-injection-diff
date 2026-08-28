# Claim verification — 2026-08-28 perfection-loop round 5

Every command in `.factory/claims.json` was run separately after `npm ci` in a
fresh clone at `/tmp/sid-polish5-clean-9MqRQo/repo`, commit
`939fc1f959def63919bd3188e77903442484e5ff`. All 21 commands selected exactly
one tagged test and passed.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `adapters` | Pass | Bundled report contains dotenv declarations plus Compose, GitHub Actions, and Kubernetes process access. |
| `dotenv-capability` | Pass | Standalone `.env` names are declarations and exit 0; Compose `env_file` binds the same name to `compose:service/api` and exits 2. |
| `compose-capability` | Pass | Temporary fixture proves environment, scalar/list `env_file`, and short/long service-secret forms. |
| `github-actions-capability` | Pass | Temporary workflow proves job env, step env, and reusable-workflow inheritance. |
| `kubernetes-capability` | Pass | Temporary Deployment proves three secret forms and excludes ConfigMaps. |
| `scope-change` | Pass | New publish process returns exit 2; a delivery-method-only refactor returns 0. |
| `same-recipient-injection-change-exit-zero` | Pass | Environment-to-secret-mount delivery change prints one delivery-method change and exits 0. |
| `check-no-change-exit-zero` | Pass | A sample checked against its own baseline returns 0. |
| `diff-addition-exit-zero` | Pass | `diff` prints the new publish process and returns 0. |
| `invalid-input-exit-one` | Pass | Missing path returns 1 and an actionable error. |
| `values-excluded` | Pass | Known fixture values are absent while secret names remain. |
| `redaction` | Pass | Opaque `secret_001` labels replace every raw name; a 200-name fixture has 200 unique labels. |
| `isolated-demo` | Pass | CLI uses a new system-temp workspace and its real result matches the browser transcript. |
| `json-output` | Pass | Output parses as schema 1 and includes process access fields. |
| `no-network` | Pass | Demo, scan, snapshot, diff, and check make no socket/connect/send syscalls under the recorder; browser requests stay same-origin. |
| `free-mit` | Pass | MIT license exists and the site has no payment path. |
| `no-decryption-storage` | Pass | Sentinel value stays out of output; source remains unchanged and no output file appears. |
| `snapshot-only-write` | Pass | Only explicit snapshot writes the requested baseline. |
| `site-data-free` | Pass | Five routes create no service worker, Cache Storage, cookies, web storage, forms, accounts, analytics, or third-party requests. |
| `build-artifacts` | Pass | `npm run build` creates non-empty `dist/site/index.html` and `dist/bin/secret-injection-diff`. |
| `explicit-adapter-limits` | Pass | Vault and SOPS-style files yield no access; source has no vendor integration or process watcher. |

`every registered claim has exactly one tagged test` also verifies unique IDs
and exact command/tag correspondence.
