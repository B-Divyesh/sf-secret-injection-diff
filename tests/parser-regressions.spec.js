import { test, expect } from '@playwright/test';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const binary = join(root, 'target/debug/secret-injection-diff');
const run = (args) => spawnSync(binary, args, { cwd: root, encoding: 'utf8' });
const write = (path, content) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
};

test('Kubernetes ignores ConfigMaps and accepts secretKeyRef keys in any order', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-kube-regression-'));
  const before = join(sandbox, 'before');
  const configOnly = join(sandbox, 'config-only');
  const reordered = join(sandbox, 'reordered');
  mkdirSync(before);
  const prefix = 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: config-only\nspec:\n  template:\n    spec:\n      containers:\n        - name: app\n';
  write(join(configOnly, 'deployment.yaml'), `${prefix}          env:\n            - name: APP_MODE\n              valueFrom:\n                configMapKeyRef:\n                  name: app-config\n                  key: mode\n          envFrom:\n            - configMapRef:\n                name: shared-config\n`);
  write(join(reordered, 'deployment.yaml'), `${prefix}          env:\n            - name: API_TOKEN\n              valueFrom:\n                secretKeyRef:\n                  key: token\n                  name: api-secret\n`);
  const baseline = join(sandbox, 'baseline.json');
  expect(run(['snapshot', before, '--output', baseline]).status).toBe(0);
  expect(run(['check', configOnly, '--baseline', baseline]).status).toBe(0);
  const result = run(['check', reordered, '--baseline', baseline]);
  expect(result.status).toBe(2);
  expect(result.stdout).toContain('api-secret/token');
  expect(result.stdout).not.toContain('app-config');
  expect(result.stdout).not.toContain('shared-config');
});

test('Compose scalar env_file adds its service recipient', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-compose-env-file-'));
  const before = join(sandbox, 'before');
  const after = join(sandbox, 'after');
  write(join(before, '.env.runtime'), 'API_TOKEN=value\n');
  write(join(after, '.env.runtime'), 'API_TOKEN=value\n');
  write(join(after, 'compose.yaml'), 'services:\n  api:\n    env_file: .env.runtime\n');
  const baseline = join(sandbox, 'baseline.json');
  expect(run(['snapshot', before, '--output', baseline]).status).toBe(0);
  const result = run(['check', after, '--baseline', baseline]);
  expect(result.status).toBe(2);
  expect(result.stdout).toContain('API_TOKEN -> compose:service/api');
});

test('Compose long-form secret uses source as the identifier and target as the mount', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-compose-secret-'));
  write(join(sandbox, 'compose.yaml'), 'services:\n  api:\n    secrets:\n      - source: server-certificate\n        target: tls.pem\n');
  const result = run(['scan', sandbox, '--json']);
  expect(result.status).toBe(0);
  const report = JSON.parse(result.stdout);
  expect(report.edges).toEqual([expect.objectContaining({
    secret: 'server-certificate',
    recipient: 'compose:service/api',
    injection: 'secret mount:/run/secrets/tls.pem'
  })]);
});

test('GitHub matrix entries do not move job-level secret recipients', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'sid-github-matrix-'));
  const before = join(sandbox, 'before');
  const after = join(sandbox, 'after');
  const header = 'jobs:\n  test:\n';
  const env = '    env:\n      DATABASE_URL: ${{ secrets.DATABASE_URL }}\n    steps:\n      - run: cargo test\n';
  write(join(before, '.github/workflows/test.yml'), `${header}${env}`);
  write(join(after, '.github/workflows/test.yml'), `${header}    strategy:\n      matrix:\n        include:\n          - os: ubuntu-latest\n${env}`);
  const baseline = join(sandbox, 'baseline.json');
  expect(run(['snapshot', before, '--output', baseline]).status).toBe(0);
  const result = run(['check', after, '--baseline', baseline]);
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('No secret access changes.');
});
