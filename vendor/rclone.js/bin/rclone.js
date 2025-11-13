#!/usr/bin/env node
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);

if (args[0] === 'selfupdate') {
  console.warn('[rclone.js] selfupdate skipped: network access is unavailable in this environment.');
  process.exit(0);
}

const binary = process.env.RCLONE_BINARY ?? 'rclone';
const child = spawn(binary, args, { stdio: 'inherit' });

child.on('error', (error) => {
  console.error('[rclone.js] Unable to run "%s". Set RCLONE_BINARY to a valid rclone executable or install rclone manually.', binary);
  console.error(error.message);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`[rclone.js] Process terminated by signal ${signal}`);
    process.exit(1);
    return;
  }

  process.exit(code ?? 0);
});
