import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const binary = join(root, 'target/debug/secret-injection-diff');
const run = (args, options = {}) => spawnSync(binary, args, { cwd: root, encoding: 'utf8', ...options });

test('@claim:adapters scans four supported configuration types', () => {
  const result = run(['scan', 'examples/demo/after', '--json']);
  expect(result.status).toBe(0);
  const report = JSON.parse(result.stdout);
  expect([...new Set(report.edges.map(edge => edge.adapter))].sort()).toEqual([
    'compose', 'dotenv', 'github-actions', 'kubernetes'
  ]);
});

test('@claim:scope-change exits 2 when a new recipient appears', () => {
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
  expect(result.stdout).toContain('1 added, 0 removed');
});

test('@claim:values-excluded keeps fixture values out of reports', () => {
  const result = run(['scan', 'examples/demo/after', '--json']);
  expect(result.status).toBe(0);
  expect(result.stdout).not.toContain('sample-pass');
  expect(result.stdout).not.toContain('sample-queue-value');
  expect(result.stdout).toContain('DATABASE_URL');
});

test('@claim:redaction replaces names in shared output', () => {
  const one = run(['scan', 'examples/demo/after', '--json', '--redact']);
  const two = run(['scan', 'examples/demo/after', '--json', '--redact']);
  expect(one.status).toBe(0);
  expect(one.stdout).toBe(two.stdout);
  expect(one.stdout).not.toContain('NPM_TOKEN');
  expect(one.stdout).toMatch(/secret_[0-9a-f]{8}/);
});

test('@claim:isolated-demo uses a new temporary workspace', () => {
  const before = readdirSync(root, { recursive: true }).sort();
  const result = run(['demo']);
  expect(result.status).toBe(0);
  const first = result.stdout.split('\n')[0];
  expect(first).toContain('Demo workspace:');
  expect(first).toContain(tmpdir());
  expect(first).not.toContain(root);
  expect(result.stdout).toMatch(/expected result: check would exit 2/i);
  expect(readdirSync(root, { recursive: true }).sort()).toEqual(before);
});

test('@claim:json-output emits parseable stable JSON', () => {
  const result = run(['scan', 'examples/demo/after', '--json']);
  const report = JSON.parse(result.stdout);
  expect(report.schema).toBe(1);
  expect(report.edges.length).toBeGreaterThan(5);
  expect(report.edges[0]).toEqual(expect.objectContaining({ secret: expect.any(String), recipient: expect.any(String), injection: expect.any(String) }));
});

test('@claim:no-network uses no network client and the demo requests only its origin', async ({ page }) => {
  const manifest = readFileSync(join(root, 'Cargo.toml'), 'utf8');
  expect(manifest).not.toMatch(/reqwest|hyper|curl|ureq|tokio|sentry|telemetry|analytics/);
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
    indexedDb: (await indexedDB.databases()).length
  }));
  expect(storage).toEqual({ local: 0, session: 0, indexedDb: 0 });
  const scripts = await page.locator('script[src]').evaluateAll(elements => elements.map(element => element.src));
  expect(scripts.every(src => new URL(src).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(readFileSync(join(root, 'site/main.js'), 'utf8')).not.toMatch(/analytics|gtag|segment|mixpanel|posthog/i);
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
