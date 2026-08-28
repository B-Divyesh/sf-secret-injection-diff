import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { cpSync } from 'node:fs';
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
  const result = run(['demo']);
  expect(result.status).toBe(0);
  const first = result.stdout.split('\n')[0];
  expect(first).toContain('Demo workspace:');
  expect(first).toContain(tmpdir());
  expect(first).not.toContain(root);
  expect(result.stdout).toMatch(/expected result: check would exit 2/i);
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
  expect(manifest).not.toMatch(/reqwest|hyper|curl|ureq|tokio/);
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
