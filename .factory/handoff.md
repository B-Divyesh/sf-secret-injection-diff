# Secret Injection Diff — round 4 handoff

## Delivered

Round 4 repairs are deployed at <https://secret-injection-diff.sociobot.in>.
The deployed product source is `ca25ce323341460b507edbc145f7a8fe52b960dc`.

- Standalone dotenv files now create declarations, never fictitious processes.
- `--redact` now emits opaque, collision-free per-output labels.
- The network claim records actual socket/connect/send behavior for every CLI command.
- Mobile first-screen facts and demo terminal guidance meet the reviewed layout requirements.
- Copy, README, claim registry, live routing, metadata, focus, legal links, 404, privacy, and demo behavior are all reverified.

## Verify

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=high
cargo package --allow-dirty
```

Every one of the 21 claim commands passed separately in clean clone
`/tmp/sid-polish4-final-clean-amaVVm/repo` at the deployed commit. Full claim
details are in `.factory/claim-results.md`; finding-by-finding evidence is in
`.factory/polish-4.md`.

The final live verification is stored under `/work/.evidence/polish4/final-live`:
five cold routes at two viewports, zero serious/critical Axe violations, no
console errors, empty browser storage, working focus and 404 behavior, and
15/15 production artifact hashes matching `dist/site`.

Lighthouse scored 100 performance, 100 accessibility, 100 best practices, and
100 SEO. The initial JS is 1,400 bytes gzip; CSS is 2,940 bytes gzip; the hero
uses no downloaded font.

## Deploy

The work-order static deploy command is:

```sh
npm ci && npm run build:site
/opt/fleet/lib/deploy-static.sh secret-injection-diff dist/site
```

## Known gaps

None.
