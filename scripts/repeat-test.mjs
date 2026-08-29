import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const repetitions = Number.parseInt(process.env.SID_TEST_REPETITIONS ?? '3', 10);

assert.ok(Number.isInteger(repetitions) && repetitions >= 2, 'SID_TEST_REPETITIONS must be an integer of at least 2');

for (let run = 1; run <= repetitions; run += 1) {
  process.stdout.write(`\nRepeat test run ${run}/${repetitions}\n`);
  // This is sequential: every child finishes, including its preview server, before
  // the next run may rebuild dist/site.
  const result = spawnSync(npm, ['test', '--', '--workers=2'], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'inherit'
  });
  assert.equal(result.status, 0, `npm test failed on repeat run ${run}/${repetitions}`);
}

console.log(`npm test passed ${repetitions} consecutive runs with isolated build artifacts`);
