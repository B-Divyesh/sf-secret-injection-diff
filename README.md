# Secret Injection Diff

Prove which processes gain secret names before a pull request merges.

This local CLI is for developers reviewing secret access across `.env`, Docker Compose, GitHub Actions, and Kubernetes files. It records which processes get secret names and compares them with an approved baseline. It returns exit code `2` when a new process gets a secret name.

The scanner does not decrypt or store secret values. Reports contain secret names, process names, and injection paths. Use `--redact` before sharing a report.

## Try the isolated demo

```sh
cargo run -- demo
```

The command copies the shipped sample project into a new temporary directory. It compares an approved workflow with a changed workflow and prints where the temporary report lives. It never reads or writes project data.

The browser recording is at <https://secret-injection-diff.sociobot.in/demo/?demo=1>. It uses bundled text and makes no third-party requests.

## Install

```sh
cargo install --path .
secret-injection-diff --help
```

Run `npm run build` to package the release binary and build the documentation site.

## Use

List which processes get each secret name:

```sh
secret-injection-diff scan .
secret-injection-diff scan . --json
secret-injection-diff scan . --redact
```

Save the current list as the approved baseline:

```sh
secret-injection-diff snapshot . --output .secret-injection-baseline.json
git add .secret-injection-baseline.json
```

Check current access against the baseline in CI:

```sh
secret-injection-diff check . --baseline .secret-injection-baseline.json
```

Exit code `0` means no process gained a secret name. Exit code `2` means at least one new process gained a secret name. Invalid input uses exit code `1`.

Changing only the injection path for the same secret name and process is reported, but the check still returns exit code `0`.

Use `diff` when you want the same comparison without a failing exit code:

```sh
secret-injection-diff diff . --baseline .secret-injection-baseline.json --redact
```

## Supported files

- `.env` and `.env.*`: declared uppercase secret names. Values are discarded and never printed.
- Docker Compose: `environment`, `env_file`, and service `secrets` entries.
- GitHub Actions: `secrets.NAME` references in job or step `env`, plus reusable workflow secret inheritance.
- Kubernetes: `secretKeyRef`, `envFrom.secretRef`, and mounted secret volumes in Pod templates.

The CLI does not guess the behavior of Vault, SOPS, Doppler, 1Password, or cloud secret managers. Add support for those sources before relying on them.

## Develop and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

The site build lands in `dist/site`. The release CLI lands in `dist/bin`.

Deploy the contents of `dist/site` to a static host. The factory handles production deployment; this repository does not manage infrastructure.

Build and test the CLI and documentation site separately:

```sh
cargo test
npm run dev
npm run build:site
cargo package --allow-dirty
```

The project has no telemetry or paid service. The website loads no files from another domain. See [privacy](https://secret-injection-diff.sociobot.in/privacy) and [terms](https://secret-injection-diff.sociobot.in/terms).

## License

MIT
