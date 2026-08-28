# Demo contract

## Browser

- URL: `https://secret-injection-diff.sociobot.in/demo/?demo=1`
- Shortcut URL: `https://secret-injection-diff.sociobot.in/?demo=1`
- Local URL: `http://127.0.0.1:5173/demo/?demo=1`
- State: bundled transcript in JavaScript memory only. There is no storage namespace because the recording accepts no user data.
- Reset: select **Reset demo**. It restores the bundled transcript and status.
- Start for real: select **Start for real** to reach and focus the install heading.

## CLI

- Command: `secret-injection-diff demo`
- Sample: `examples/demo/before` and `examples/demo/after`
- Scenario: a GitHub Actions publish step gains `NPM_TOKEN`; Compose, `.env`, and Kubernetes examples provide the wider graph.
- Isolation: every run creates a new `secret-injection-diff-demo-*` directory under the operating system temporary directory.
- Output: the command prints the temporary directory and baseline path. It does not read or write the caller’s project.
- Reset: run the command again. Each run receives a new directory.
