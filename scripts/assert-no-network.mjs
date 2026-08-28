import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const binary = join(root, 'target/debug/secret-injection-diff');
const sandbox = mkdtempSync(join(tmpdir(), 'sid-network-recorder-'));
const recorder = join(sandbox, 'network-recorder.so');
const compile = spawnSync('cc', [
  '-shared', '-fPIC', '-O2', '-o', recorder, join(root, 'tests/network-recorder.c'), '-ldl'
], { cwd: root, encoding: 'utf8' });

if (compile.status !== 0) {
  process.stderr.write(compile.stderr || compile.stdout);
  process.exit(1);
}

const before = join(sandbox, 'before');
const after = join(sandbox, 'after');
const baseline = join(sandbox, 'baseline.json');
cpSync(join(root, 'examples/demo/before'), before, { recursive: true });
cpSync(join(root, 'examples/demo/after'), after, { recursive: true });

const run = (name, args, expectedStatus) => {
  const log = join(sandbox, `${name}.log`);
  const result = spawnSync(binary, args, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, LD_PRELOAD: recorder, SID_NETWORK_LOG: log }
  });
  if (result.status !== expectedStatus) {
    process.stderr.write(`${name} exited ${result.status}; expected ${expectedStatus}\n${result.stderr}`);
    process.exit(1);
  }
  const calls = existsSync(log) ? readFileSync(log, 'utf8').trim() : '';
  if (calls) {
    process.stderr.write(`${name} made network-related syscalls:\n${calls}\n`);
    process.exit(1);
  }
};

run('demo', ['demo'], 0);
run('scan', ['scan', after, '--json'], 0);
run('snapshot', ['snapshot', before, '--output', baseline], 0);
run('diff', ['diff', after, '--baseline', baseline], 0);
run('check', ['check', after, '--baseline', baseline], 2);
console.log('network syscall recorder observed no socket/connect/send activity');
