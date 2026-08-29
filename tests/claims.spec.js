import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const binary = join(root, 'target/debug/secret-injection-diff');
const run = (args, options = {}) => spawnSync(binary, args, { cwd: root, encoding: 'utf8', ...options });
const write = (path, content) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
};
const snapshotFiles = directory => Object.fromEntries(
  readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => {
      const path = join(entry.parentPath, entry.name);
      return [path.slice(directory.length + 1), readFileSync(path, 'utf8')];
    })
);

test('every registered claim has exactly one tagged test', () => {
  const claims = JSON.parse(readFileSync(join(root, '.factory/claims.json'), 'utf8'));
  const source = readFileSync(join(root, 'tests/claims.spec.js'), 'utf8');
  expect(new Set(claims.map(claim => claim.id)).size).toBe(claims.length);
  for (const claim of claims) {
    expect(claim.test).toBe(`npm test -- --grep @claim:${claim.id}`);
    expect(source.split(`@claim:${claim.id}`).length - 1).toBe(1);
  }
});

test('human CLI output uses process and access language', () => {
  const scan = run(['scan', 'examples/demo/after']);
  const help = run(['--help']);
  const demo = run(['demo']);
  const workspace = demo.stdout.split('\n')[0].slice(demo.stdout.indexOf(':') + 1).trim();
  const check = run(['check', join(workspace, 'after'), '--baseline', join(workspace, 'baseline.json')]);
  const output = `${scan.stdout}\n${scan.stderr}\n${help.stdout}\n${help.stderr}\n${demo.stdout}\n${demo.stderr}\n${check.stdout}\n${check.stderr}`;
  expect(scan.status).toBe(0);
  expect(help.status).toBe(0);
  expect(demo.status).toBe(0);
  expect(check.status).toBe(2);
  expect(output).toContain('secret access entries');
  expect(output).toContain('unapproved process gained a secret name');
  expect(output).not.toMatch(/\brecipient(s)?\b|\bedges?\b|\bgraph\b|\badapters?\b|\bidentifiers?\b|\bcredential\b/i);
});

test('@claim:adapters scans four supported configuration types', () => {
  const result = run(['scan', 'examples/demo/after', '--json']);
  expect(result.status).toBe(0);
  const report = JSON.parse(result.stdout);
  expect([...new Set([...report.edges, ...report.declarations].map(item => item.adapter))].sort()).toEqual([
    'compose', 'dotenv', 'github-actions', 'kubernetes'
  ]);
});

test('@claim:scope-change exits 2 when a new process receives a secret name', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-claim-scope-'));
  const before = join(sandbox, 'before');
  const after = join(sandbox, 'after');
  cpSync(join(root, 'examples/demo/before'), before, { recursive: true });
  cpSync(join(root, 'examples/demo/after'), after, { recursive: true });
  const baseline = join(sandbox, 'baseline.json');
  expect(run(['snapshot', before, '--output', baseline]).status).toBe(0);
  const result = run(['check', after, '--baseline', baseline]);
  expect(result.status).toBe(2);
  expect(result.stdout).toContain('+ NPM_TOKEN -> github:job/verify/step/Publish package');
  expect(result.stdout).toContain('1 process added, 0 removed');

  const refactorBefore = join(sandbox, 'refactor-before');
  const refactorAfter = join(sandbox, 'refactor-after');
  write(join(refactorBefore, 'compose.yaml'), 'services:\n  api:\n    environment:\n      API_TOKEN: ${API_TOKEN}\n');
  write(join(refactorAfter, 'compose.yaml'), 'services:\n  api:\n    secrets:\n      - source: API_TOKEN\n        target: token\n');
  const refactorBaseline = join(sandbox, 'refactor-baseline.json');
  expect(run(['snapshot', refactorBefore, '--output', refactorBaseline]).status).toBe(0);
  expect(run(['check', refactorAfter, '--baseline', refactorBaseline]).status).toBe(0);
});

test('@claim:same-recipient-injection-change-exit-zero keeps an approved process approved when its delivery method changes', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-claim-injection-change-'));
  const before = join(sandbox, 'before');
  const after = join(sandbox, 'after');
  write(join(before, 'compose.yaml'), 'services:\n  api:\n    environment:\n      API_TOKEN: ${API_TOKEN}\n');
  write(join(after, 'compose.yaml'), 'services:\n  api:\n    secrets:\n      - source: API_TOKEN\n        target: token\n');
  const baseline = join(sandbox, 'baseline.json');
  expect(run(['snapshot', before, '--output', baseline]).status).toBe(0);
  const result = run(['check', after, '--baseline', baseline]);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('~ API_TOKEN -> compose:service/api');
  expect(result.stdout).toContain('[environment:API_TOKEN -> secret mount:/run/secrets/token]');
  expect(result.stdout).toContain('0 processes added, 0 removed; 1 delivery method changed');
  expect(result.stderr).not.toContain('check failed');
});

test('@claim:check-no-change-exit-zero exits 0 when access does not expand', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-claim-zero-'));
  const project = join(sandbox, 'project');
  cpSync(join(root, 'examples/demo/before'), project, { recursive: true });
  const baseline = join(sandbox, 'baseline.json');
  expect(run(['snapshot', project, '--output', baseline]).status).toBe(0);
  const result = run(['check', project, '--baseline', baseline]);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('No secret access changes.');
});

test('@claim:diff-addition-exit-zero reports new process access without failing', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-claim-diff-zero-'));
  const before = join(sandbox, 'before');
  const after = join(sandbox, 'after');
  cpSync(join(root, 'examples/demo/before'), before, { recursive: true });
  cpSync(join(root, 'examples/demo/after'), after, { recursive: true });
  const baseline = join(sandbox, 'baseline.json');
  expect(run(['snapshot', before, '--output', baseline]).status).toBe(0);
  const result = run(['diff', after, '--baseline', baseline]);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('+ NPM_TOKEN -> github:job/verify/step/Publish package');
  expect(result.stdout).toContain('1 process added, 0 removed');
});

test('@claim:dotenv-capability records .env names as declarations and binds them only through Compose env_file', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-claim-dotenv-'));
  write(join(sandbox, '.env'), 'ROOT_TOKEN=value\nlower_name=ignored\n');
  write(join(sandbox, '.env.production'), 'export PROD_TOKEN=value\nINVALID-NAME=value\n');
  write(join(sandbox, '.env.local'), 'LOCAL_TOKEN: value\n');
  write(join(sandbox, 'env.ignored'), 'IGNORED_TOKEN=value\n');
  const result = run(['scan', sandbox, '--json']);
  expect(result.status).toBe(0);
  const report = JSON.parse(result.stdout);
  expect(report.edges).toEqual([]);
  expect(report.declarations.map(declaration => [declaration.secret, declaration.source])).toEqual([
    ['LOCAL_TOKEN', '.env.local'],
    ['PROD_TOKEN', '.env.production'],
    ['ROOT_TOKEN', '.env']
  ]);
  expect(result.stdout).not.toContain('lower_name');
  expect(result.stdout).not.toContain('INVALID-NAME');
  expect(result.stdout).not.toContain('IGNORED_TOKEN');

  const before = join(sandbox, 'before');
  const after = join(sandbox, 'after');
  mkdirSync(before);
  write(join(after, '.env.runtime'), 'BOUND_TOKEN=value\n');
  const baseline = join(sandbox, 'baseline.json');
  expect(run(['snapshot', before, '--output', baseline]).status).toBe(0);
  const declarationOnly = run(['check', after, '--baseline', baseline]);
  expect(declarationOnly.status).toBe(0);
  const declarationReport = JSON.parse(run(['scan', after, '--json']).stdout);
  expect(declarationReport.declarations).toEqual([
    expect.objectContaining({ secret: 'BOUND_TOKEN', source: '.env.runtime', adapter: 'dotenv' })
  ]);
  expect(declarationReport.edges).toEqual([]);

  write(join(after, 'compose.yaml'), 'services:\n  api:\n    env_file: .env.runtime\n');
  const bound = run(['check', after, '--baseline', baseline]);
  expect(bound.status).toBe(2);
  expect(bound.stdout).toContain('BOUND_TOKEN -> compose:service/api');
});

test('@claim:compose-capability scans environment, scalar and list env_file, and short and long secrets', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-claim-compose-'));
  write(join(sandbox, 'scalar.env'), 'SCALAR_TOKEN=value\n');
  write(join(sandbox, 'list.env'), 'LIST_TOKEN=value\n');
  write(join(sandbox, 'compose.yaml'), `services:
  api:
    environment:
      API_TOKEN: \${SOURCE_TOKEN}
    env_file: scalar.env
    secrets:
      - short-secret
      - source: long-secret
        target: long.pem
  worker:
    env_file:
      - list.env
`);
  const result = run(['scan', sandbox, '--json']);
  expect(result.status).toBe(0);
  const edges = JSON.parse(result.stdout).edges;
  expect(edges).toEqual(expect.arrayContaining([
    expect.objectContaining({ secret: 'SOURCE_TOKEN', recipient: 'compose:service/api', injection: 'environment:API_TOKEN' }),
    expect.objectContaining({ secret: 'SCALAR_TOKEN', recipient: 'compose:service/api', injection: 'env_file:scalar.env' }),
    expect.objectContaining({ secret: 'LIST_TOKEN', recipient: 'compose:service/worker', injection: 'env_file:list.env' }),
    expect.objectContaining({ secret: 'short-secret', recipient: 'compose:service/api', injection: 'secret mount:/run/secrets/short-secret' }),
    expect.objectContaining({ secret: 'long-secret', recipient: 'compose:service/api', injection: 'secret mount:/run/secrets/long.pem' })
  ]));
});

test('@claim:github-actions-capability scans job env, step env, and reusable workflow inheritance', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-claim-github-'));
  write(join(sandbox, '.github/workflows/release.yml'), `jobs:
  build:
    env:
      BUILD_TOKEN: \${{ secrets.BUILD_TOKEN }}
    steps:
      - name: Publish
        env:
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}
  deploy:
    uses: example/repository/.github/workflows/deploy.yml@main
    secrets: inherit
`);
  const result = run(['scan', sandbox, '--json']);
  expect(result.status).toBe(0);
  const edges = JSON.parse(result.stdout).edges;
  expect(edges).toEqual(expect.arrayContaining([
    expect.objectContaining({ secret: 'BUILD_TOKEN', recipient: 'github:job/build', injection: 'env:BUILD_TOKEN' }),
    expect.objectContaining({ secret: 'NPM_TOKEN', recipient: 'github:job/build/step/Publish', injection: 'env:NPM_TOKEN' }),
    expect.objectContaining({ secret: 'inherited-secrets/*', recipient: 'github:job/deploy', injection: 'reusable workflow secret inheritance' })
  ]));
});

test('@claim:kubernetes-capability scans three secret forms and ignores ConfigMaps', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-claim-kubernetes-'));
  write(join(sandbox, 'deployment.yaml'), `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  template:
    spec:
      volumes:
        - name: credentials
          secret:
            secretName: mounted-secret
      containers:
        - name: app
          env:
            - name: API_TOKEN
              valueFrom:
                secretKeyRef:
                  key: token
                  name: api-secret
            - name: APP_MODE
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: mode
          envFrom:
            - secretRef:
                name: shared-secret
            - configMapRef:
                name: shared-config
          volumeMounts:
            - name: credentials
              mountPath: /run/credentials
`);
  const result = run(['scan', sandbox, '--json']);
  expect(result.status).toBe(0);
  const edges = JSON.parse(result.stdout).edges;
  expect(edges).toEqual(expect.arrayContaining([
    expect.objectContaining({ secret: 'api-secret/token', injection: 'env:API_TOKEN' }),
    expect.objectContaining({ secret: 'shared-secret/*', injection: 'envFrom:secretRef' }),
    expect.objectContaining({ secret: 'mounted-secret/*', injection: 'secret volume:credentials' })
  ]));
  expect(result.stdout).not.toContain('app-config');
  expect(result.stdout).not.toContain('shared-config');
});

test('@claim:invalid-input-exit-one exits 1 with a useful error for invalid input', () => {
  const missing = join(tmpdir(), `sid-missing-${process.pid}-${Date.now()}`);
  const result = run(['scan', missing]);
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('error:');
  expect(result.stderr).toMatch(/does not exist|no such file/i);
});

test('@claim:values-excluded keeps fixture values out of reports', () => {
  const result = run(['scan', 'examples/demo/after', '--json']);
  expect(result.status).toBe(0);
  expect(result.stdout).not.toContain('sample-pass');
  expect(result.stdout).not.toContain('sample-queue-value');
  expect(result.stdout).toContain('DATABASE_URL');
});

test('@claim:redaction replaces every name with collision-free opaque labels', () => {
  const one = run(['scan', 'examples/demo/after', '--json', '--redact']);
  const two = run(['scan', 'examples/demo/after', '--json', '--redact']);
  expect(one.status).toBe(0);
  expect(one.stdout).toBe(two.stdout);
  expect(one.stdout).not.toContain('NPM_TOKEN');
  expect(one.stdout).toMatch(/secret_\d{3}/);
  expect(one.stdout).not.toMatch(/secret_[0-9a-f]{8}/);
  expect(one.stdout).not.toContain('39225bb4');

  const many = mkdtempSync(join(tmpdir(), 'sid-claim-redaction-many-'));
  const names = Array.from({ length: 200 }, (_, index) => `SECRET_${index}_TOKEN`);
  write(join(many, '.env'), names.map(name => `${name}=value`).join('\n'));
  const manyResult = run(['scan', many, '--json', '--redact']);
  expect(manyResult.status).toBe(0);
  const manyReport = JSON.parse(manyResult.stdout);
  const labels = manyReport.declarations.map(declaration => declaration.secret);
  expect(new Set(labels).size).toBe(names.length);
  expect(labels).toEqual(expect.arrayContaining(['secret_001', 'secret_200']));
  for (const name of names) expect(manyResult.stdout).not.toContain(name);

  const sandbox = mkdtempSync(join(tmpdir(), 'sid-claim-redacted-change-'));
  const before = join(sandbox, 'before');
  const after = join(sandbox, 'after');
  write(join(before, 'compose.yaml'), 'services:\n  api:\n    environment:\n      API_TOKEN: ${API_TOKEN}\n');
  write(join(after, 'compose.yaml'), 'services:\n  api:\n    secrets:\n      - source: API_TOKEN\n        target: token\n');
  const baseline = join(sandbox, 'baseline.json');
  expect(run(['snapshot', before, '--output', baseline]).status).toBe(0);
  const changed = run(['diff', after, '--baseline', baseline, '--json', '--redact']);
  expect(changed.status).toBe(0);
  expect(changed.stdout).not.toContain('API_TOKEN');
  expect(JSON.parse(changed.stdout).injection_changes[0]).toEqual(expect.objectContaining({
    secret: expect.stringMatching(/^secret_\d{3}$/),
    before: ['environment'],
    after: ['secret mount']
  }));
});

test('@claim:isolated-demo uses a new temporary workspace', () => {
  const samples = join(root, 'examples/demo');
  const before = snapshotFiles(samples);
  const result = run(['demo']);
  expect(result.status).toBe(0);
  const first = result.stdout.split('\n')[0];
  expect(first).toContain('Demo workspace:');
  expect(first).toContain(tmpdir());
  expect(first).not.toContain(root);
  expect(result.stdout).toMatch(/expected result: check would exit 2/i);
  const workspace = first.slice(first.indexOf(':') + 1).trim();
  const recordedCheck = run(['check', join(workspace, 'after'), '--baseline', join(workspace, 'baseline.json')]);
  const browserTranscript = readFileSync(join(root, 'site/main.js'), 'utf8');
  expect(recordedCheck.status).toBe(2);
  expect(browserTranscript).toContain('+ NPM_TOKEN -> github:job/verify/step/Publish package');
  expect(browserTranscript).toContain('1 process added, 0 removed; 0 delivery methods changed');
  expect(browserTranscript).toContain(recordedCheck.stderr.trim());
  expect(snapshotFiles(samples)).toEqual(before);
});

test('@claim:json-output emits parseable JSON', () => {
  const result = run(['scan', 'examples/demo/after', '--json']);
  const report = JSON.parse(result.stdout);
  expect(report.schema).toBe(1);
  expect(report.edges.length).toBeGreaterThan(5);
  expect(report.edges[0]).toEqual(expect.objectContaining({ secret: expect.any(String), recipient: expect.any(String), injection: expect.any(String) }));
});

test('@claim:no-network records no CLI network syscalls and the demo requests only its origin', async ({ page }) => {
  const manifest = readFileSync(join(root, 'Cargo.toml'), 'utf8');
  expect(manifest).not.toMatch(/reqwest|hyper|curl|ureq|tokio|sentry|telemetry|analytics/);
  const cliSource = readFileSync(join(root, 'src/main.rs'), 'utf8');
  expect(cliSource).not.toMatch(/std::net|TcpStream|UdpSocket|socket\(|connect\(|send\(/);
  const recorder = spawnSync('node', ['scripts/assert-no-network.mjs'], { cwd: root, encoding: 'utf8' });
  expect(recorder.status, recorder.stderr).toBe(0);
  expect(recorder.stdout).toContain('no socket/connect/send activity');
  const origins = new Set();
  page.on('request', request => origins.add(new URL(request.url()).origin));
  await page.goto('/demo/');
  await expect(page.locator('[data-terminal]')).toContainText('exit 2');
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
});

test('@claim:free-mit has no payment path and ships the MIT license', async ({ page }) => {
  expect(readFileSync(join(root, 'LICENSE'), 'utf8')).toContain('MIT License');
  await page.goto('/');
  await expect(page.getByText('Free · MIT licensed')).toBeVisible();
  expect(await page.locator('a').allTextContents()).not.toContain('Buy');
});

test('@claim:no-decryption-storage reads names without decrypting or storing secrets', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-claim-no-store-'));
  const fixture = join(sandbox, '.env.production');
  const content = 'API_TOKEN=sentinel-value-that-must-not-leave\n';
  writeFileSync(fixture, content);
  const before = readdirSync(sandbox).sort();
  const result = run(['scan', sandbox, '--json']);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('API_TOKEN');
  expect(result.stdout).not.toContain('sentinel-value-that-must-not-leave');
  expect(readFileSync(fixture, 'utf8')).toBe(content);
  expect(readdirSync(sandbox).sort()).toEqual(before);
  expect(readFileSync(join(root, 'Cargo.toml'), 'utf8')).not.toMatch(/aes|decrypt|openssl|ring\s*=/i);
});

test('@claim:snapshot-only-write writes only the requested baseline', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-claim-write-'));
  writeFileSync(join(sandbox, '.env.production'), 'API_TOKEN=value\n');
  expect(run(['scan', sandbox]).status).toBe(0);
  expect(readdirSync(sandbox).sort()).toEqual(['.env.production']);
  const baseline = join(sandbox, 'approved.json');
  expect(run(['snapshot', sandbox, '--output', baseline]).status).toBe(0);
  expect(readdirSync(sandbox).sort()).toEqual(['.env.production', 'approved.json']);
  expect(run(['check', sandbox, '--baseline', baseline]).status).toBe(0);
  expect(run(['diff', sandbox, '--baseline', baseline]).status).toBe(0);
  expect(readdirSync(sandbox).sort()).toEqual(['.env.production', 'approved.json']);
});

test('@claim:site-data-free site has no analytics, accounts, forms, cookies, or data storage', async ({ page, context }) => {
  const origins = new Set();
  page.on('request', request => origins.add(new URL(request.url()).origin));
  for (const path of ['/', '/demo/', '/privacy/', '/terms/', '/404.html']) await page.goto(path);
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
  expect(await context.cookies()).toEqual([]);
  expect(await page.locator('form, input, textarea, select').count()).toBe(0);
  expect(await page.locator('a[href*="login"], a[href*="signin"], a[href*="account"]').count()).toBe(0);
  const storage = await page.evaluate(async () => ({
    local: localStorage.length,
    session: sessionStorage.length,
    indexedDb: (await indexedDB.databases()).length,
    caches: await caches.keys(),
    serviceWorkers: await navigator.serviceWorker.getRegistrations().then(items => items.length)
  }));
  expect(storage).toEqual({ local: 0, session: 0, indexedDb: 0, caches: [], serviceWorkers: 0 });
  const scripts = await page.locator('script[src]').evaluateAll(elements => elements.map(element => element.src));
  expect(scripts.every(src => new URL(src).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(readFileSync(join(root, 'site/main.js'), 'utf8')).not.toMatch(/analytics|gtag|segment|mixpanel|posthog/i);
  expect(existsSync(join(root, 'site/public/sw.js'))).toBe(false);
});

test('@claim:build-artifacts confirms the serial preflight created the documented site and CLI paths', () => {
  const site = join(root, 'dist/site/index.html');
  const cli = join(root, 'dist/bin/secret-injection-diff');
  expect(existsSync(site)).toBe(true);
  expect(existsSync(cli)).toBe(true);
  expect(statSync(site).size).toBeGreaterThan(0);
  expect(statSync(cli).size).toBeGreaterThan(0);
});

test('@claim:explicit-adapter-limits ignores vendor configs and has no process watcher', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-claim-limits-'));
  writeFileSync(join(sandbox, 'vault.yml'), 'vault:\n  path: secret/data/app\n  token: vault-token\n');
  writeFileSync(join(sandbox, 'secrets.sops.yaml'), 'database_password: ENC[AES256_GCM,data:fixture]\nsops:\n  version: 3.9.0\n');
  const report = JSON.parse(run(['scan', sandbox, '--json']).stdout);
  expect(report.edges).toEqual([]);
  const manifest = readFileSync(join(root, 'Cargo.toml'), 'utf8');
  expect(manifest).not.toMatch(/notify|sysinfo|procfs|reqwest|hyper/);
  const scanner = readFileSync(join(root, 'src/scan.rs'), 'utf8');
  expect(scanner).not.toMatch(/vault|sops|doppler|1password/i);
});
