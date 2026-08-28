# Claim verification — 2026-08-28 perfection-loop round 2

Every command in `.factory/claims.json` was run separately after `npm ci` in clean clone `/tmp/sid-polish2-clean-jpcy9V` at repair commit `d67773d971ba810659d10490bbffcf325f8cd585`. Each command selected exactly one tagged test and passed.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `adapters` | Pass | Bundled output contains dotenv, Compose, GitHub Actions, and Kubernetes edges. |
| `scope-change` | Pass | A new `NPM_TOKEN` recipient returns exit code 2. |
| `check-no-change-exit-zero` | Pass | An unchanged sample checked against its own baseline returns exit code 0. |
| `invalid-input-exit-one` | Pass | A missing path returns exit code 1 and an error naming the missing input. |
| `values-excluded` | Pass | Known fixture values are absent from JSON output. |
| `redaction` | Pass | Two runs produce the same hash and omit `NPM_TOKEN`. |
| `isolated-demo` | Pass | The workspace is under the system temp directory and the project tree is unchanged. |
| `json-output` | Pass | Output parses with schema 1 and complete edge fields. |
| `no-network` | Pass | CLI dependencies contain no network or telemetry client; demo requests remain same-origin. |
| `free-mit` | Pass | The MIT license exists and the site has no payment path. |
| `no-decryption-storage` | Pass | A sentinel value is absent from output; its source stays unchanged and no output file appears. |
| `snapshot-only-write` | Pass | Scan/check/diff create no files; snapshot creates only the requested baseline. |
| `site-data-free` | Pass | Five routes create no service worker, Cache Storage, cookies, web storage, forms, accounts, analytics, or third-party requests. |
| `build-artifacts` | Pass | `npm run build` creates non-empty site and CLI outputs in both documented paths. |
| `explicit-adapter-limits` | Pass | Vault and SOPS-style YAML produce no edges; source has no vendor adapter or process watcher. |

The full suite also includes exact regressions for ConfigMap false positives, reordered `secretKeyRef`, scalar Compose `env_file`, long-form Compose secrets, and GitHub matrix recipient stability.
