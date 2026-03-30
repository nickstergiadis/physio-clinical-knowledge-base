import { execSync } from 'node:child_process';

function run() {
  execSync('tsx scripts/import-knowledge-base.ts', { stdio: 'inherit' });
}

run();
