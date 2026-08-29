import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

// This preflight deliberately finishes before Playwright starts its preview server.
// Browser tests may observe dist/site, but never rebuild or empty that live directory.
const root = resolve(import.meta.dirname, '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const build = spawnSync(npm, ['run', 'build'], { cwd: root, encoding: 'utf8' });

assert.equal(build.status, 0, build.stderr || build.stdout || 'npm run build failed');

const required = [
  resolve(root, 'dist/site/index.html'),
  resolve(root, 'dist/bin/secret-injection-diff')
];

for (const artifact of required) {
  assert.ok(existsSync(artifact), `missing build artifact: ${artifact}`);
  assert.ok(statSync(artifact).size > 0, `empty build artifact: ${artifact}`);
}

console.log('build-artifact preflight created non-empty dist/site and dist/bin outputs');
