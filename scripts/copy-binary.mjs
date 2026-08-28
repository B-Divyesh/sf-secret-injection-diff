import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('dist/bin', { recursive: true });
await copyFile('target/release/secret-injection-diff', 'dist/bin/secret-injection-diff');
