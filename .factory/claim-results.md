# Claim verification — 2026-08-28 repair

Every command in `.factory/claims.json` was run separately after a clean `npm ci`. Each command selected exactly one tagged test and passed.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `adapters` | Pass | Bundled output contains dotenv, Compose, GitHub Actions, and Kubernetes edges. |
| `scope-change` | Pass | A new `NPM_TOKEN` recipient returns exit code 2. |
| `values-excluded` | Pass | Known fixture values are absent from JSON output. |
| `redaction` | Pass | Two runs produce the same hash and omit `NPM_TOKEN`. |
| `isolated-demo` | Pass | The workspace is under the system temp directory and the project tree is unchanged. |
| `json-output` | Pass | Output parses with schema 1 and complete edge fields. |
| `no-network` | Pass | CLI dependencies contain no network or telemetry client; demo requests remain same-origin. |
| `free-mit` | Pass | The MIT license exists and the site has no payment path. |
| `no-decryption-storage` | Pass | A sentinel value is absent from output; its source stays unchanged and no output file appears. |
| `snapshot-only-write` | Pass | Scan/check/diff create no files; snapshot creates only the requested baseline. |
| `site-data-free` | Pass | Five routes create no cookies, web storage, forms, account controls, analytics, or third-party requests. |
| `explicit-adapter-limits` | Pass | Vault and SOPS-style YAML produce no edges; source has no vendor adapter or process watcher. |

The full suite also includes exact regressions for ConfigMap false positives, reordered `secretKeyRef`, scalar Compose `env_file`, long-form Compose secrets, and GitHub matrix recipient stability.
