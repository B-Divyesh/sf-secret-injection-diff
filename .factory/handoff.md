# Handoff — Secret Injection Diff v0.1.0

## What shipped

- A Rust single-binary CLI with `scan`, `snapshot`, `diff`, `check`, and `demo` commands.
- Explicit adapters for `.env`, Docker Compose, GitHub Actions, and Kubernetes workloads.
- Recipient-edge baselines, deterministic JSON, stable name redaction, useful errors, and CI exit code `2` for additions.
- Bundled before/after examples. `secret-injection-diff demo` copies them into a new temporary directory.
- A five-route static site: `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html`.
- Original surreal editorial art, responsive WebP sources, complete metadata, security headers, a service worker, and an accessible keyboard path.
- Claims, demo, design, copy-audit, and quality records under `.factory/`.

## Build and run

```sh
npm ci
npm test
npm run build
```

`npm run build` is the reproducible build command. It writes the deployable site to `dist/site` and the release binary to `dist/bin/secret-injection-diff`.

Useful direct commands:

```sh
cargo run -- demo
cargo run -- scan examples/demo/after --json
cargo package --allow-dirty
```

## Verification

- `cargo test`: 5 passed.
- `npm test`: 16 Playwright tests passed after the Rust suite.
- `npm test -- --grep @claim:scope-change`: focused claim command passed.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `npm run build`: passed; site and binary landed in their required directories.
- `cargo package --allow-dirty`: package verification passed; archive size was 392.8 KiB compressed.
- Clean archive: `npm ci` and `npm run build` passed in a new `/tmp/sid-clean-*` directory.
- `/opt/fleet/lib/verify-url.sh`: title, language, main, alt text, labels, and console checks passed with zero console errors.
- Axe 4.10.2: zero serious or critical issues on all five routes.
- Playwright: desktop Chromium and a 390 × 844 viewport passed with no horizontal page overflow.
- Lighthouse mobile production preview: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.9 s, TBT 0 ms, CLS 0.
- Initial asset budgets: JS 1.05 KiB gzip, CSS 2.78 KiB gzip, mobile hero 40,918 bytes, desktop hero 132,680 bytes, fonts 0 bytes.

Claim-by-claim evidence is recorded in `.factory/claim-results.md`. Measured budgets are recorded in `.factory/quality.json`.

## Privacy and security notes

- The CLI has no network client or telemetry dependency.
- Parsers retain only identifiers and routing metadata in reports. They never emit configuration values.
- `--redact` replaces secret names with stable local hashes and removes target details from injection labels.
- The website loads no third-party scripts, fonts, or analytics.

## Known gaps

- Adapters intentionally cover documented configuration shapes only. They do not infer Vault, SOPS, cloud secret-manager, or arbitrary action semantics.
- The Kubernetes parser expects one workload identity per YAML file. Split multi-document manifests before creating a baseline.
- GitHub Actions references under arbitrary `with:` inputs are not treated as process environment injection.
- No registry package or release artifact was published. The factory owns publishing credentials.

## Next steps

- Add explicit GitLab CI and systemd adapters based on real repository fixtures.
- Add a Kubernetes multi-document iterator while preserving the no-value report contract.
- Publish signed platform binaries after the factory creates a release.
