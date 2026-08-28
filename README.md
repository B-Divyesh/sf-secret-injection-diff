# Secret Injection Diff

Prove which processes gain secret names before a pull request merges.

This local CLI is for developers reviewing environment scope across `.env`, Docker Compose, GitHub Actions, and Kubernetes files. It records recipient edges, compares them with an approved baseline, and returns exit code `2` when a new edge appears.

The scanner does not decrypt or store secrets. Reports contain identifiers, recipients, and injection paths. Use `--redact` before sharing a report.

## Try the isolated demo

```sh
cargo run -- demo
```

The command copies the shipped sample project into a new temporary directory. It compares an approved workflow with a changed workflow and prints where the temporary report lives. It never reads or writes project data.

The browser recording is at <https://secret-injection-diff.sociobot.in/demo>. It uses bundled text and makes no third-party requests.

## Install

Rust 1.85 or newer is required to build from source.

```sh
cargo install --path .
secret-injection-diff --help
```

The factory can also package the release binary with `cargo build --release`.

## Use

Start by reviewing the discovered edges:

```sh
secret-injection-diff scan .
secret-injection-diff scan . --json
secret-injection-diff scan . --redact
```

Approve the current graph:

```sh
secret-injection-diff snapshot . --output .secret-injection-baseline.json
git add .secret-injection-baseline.json
```

Check the graph in CI:

```sh
secret-injection-diff check . --baseline .secret-injection-baseline.json
```

Exit code `0` means no new recipient edge. Exit code `2` means at least one undeclared edge appeared. Other errors use exit code `1`.

Use `diff` when you want the same comparison without a failing exit code:

```sh
secret-injection-diff diff . --baseline .secret-injection-baseline.json --redact
```

## Supported adapters

- `.env` and `.env.*`: declared uppercase identifiers. Values are discarded and never printed.
- Docker Compose: `environment`, `env_file`, and service `secrets` entries.
- GitHub Actions: `secrets.NAME` references in job or step `env`, plus reusable workflow secret inheritance.
- Kubernetes: `secretKeyRef`, `envFrom.secretRef`, and mounted secret volumes in Pod templates.

The CLI does not guess the behavior of Vault, SOPS, Doppler, 1Password, or cloud secret managers. Add an explicit adapter before relying on those sources.

## Develop and verify

```sh
npm install
npm test
npm run build
```

The site build lands in `dist/site`. The release CLI lands in `dist/bin`.

To work on each half separately:

```sh
cargo test
npm run dev
npm run build:site
cargo package --allow-dirty
```

The project has no telemetry, runtime CDN, or paid service. See [privacy](https://secret-injection-diff.sociobot.in/privacy) and [terms](https://secret-injection-diff.sociobot.in/terms).

## License

MIT
