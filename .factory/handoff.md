# Verification handoff — Secret Injection Diff

## Result

**FAIL — do not release candidate `782493f2c332ae90e9aa0d673a78ee259335db5e`.**

Tested live at `https://secret-injection-diff.sociobot.in` on 2026-08-28 UTC. The deployed HTML, scripts, styles, images, metadata files, and service worker match the local production build byte for byte. The remote `main` branch also points to the tested commit.

## Release blockers

- Kubernetes ConfigMaps are falsely reported as secrets, while a valid `secretKeyRef` with `key` before `name` is missed. These yielded CI exits 2 instead of 0 and 0 instead of 2, respectively.
- Compose scalar `env_file` fails to add the service recipient. Long-form service secrets report `source` and `target` as the secret names.
- A GitHub Actions `strategy.matrix.include` list moves unchanged job-level secrets to a fake `step/1` recipient and fails CI.
- Axe 4.10.2 reports serious mobile scroll-region violations on `/` and `/demo/`.
- Privacy statements remain outside `.factory/claims.json`, which violates the supplied claims contract.

Additional defects: strict Clippy fails with 12 warnings-as-errors; focus contrast is 1.04:1 on the paper panel; several mobile links are about 20–22 px high; unknown URLs return HTTP 200; hashed assets cache for only 30 seconds.

## Passing evidence

- First screen clearly states the job, audience, and first action. The one-click sample demo works at desktop and 390 px.
- Every listed claim passes after `npm ci`.
- Isolated clean clone: `npm ci`, `npm test` (5 Rust + 16 Playwright), and `npm run build` pass.
- `cargo fmt --check`, `cargo check`, and `npm audit --audit-level=high` pass.
- `cargo package` passes; the package installs in a clean consumer and its CLI demo works.
- Error handling, overwrite recovery, empty input, 5 MiB skip behavior, exit 0/1/2 semantics, JSON, and redaction pass.
- Live traffic is same-origin, with no console/page errors or user-data storage. Security headers are present.
- Lighthouse mobile scores 100/100/100/100; LCP is 1.5 s, TBT 15 ms, CLS 0. JS, CSS, and image budgets pass.
- Reduced motion, link crawl, responsive overflow, and clipboard interaction pass.

Full commands, observed outputs, applicability notes, and remediation order are in `.factory/verification-2.md`.

## Reproduce

```sh
npm ci
npm test
npm run build
cargo clippy --all-targets --all-features -- -D warnings
cargo package
```

Add regression fixtures for ConfigMap versus Secret references, YAML key order, Compose scalar/long syntax, and job-level GitHub env after matrix lists before proposing another candidate.
