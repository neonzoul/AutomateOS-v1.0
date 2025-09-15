#!/usr/bin/env node
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

function log() {
  console.log.apply(console, ['[dev-with-mock]'].concat(Array.from(arguments)));
}

const root = path.resolve(__dirname, '..');

// Start Next dev server via pnpm dev (workspace-aware)
const dev = spawn('pnpm', ['dev'], {
  cwd: root,
  shell: true,
  stdio: 'inherit',
});

// Start mock gateway
const mock = spawn('node', ['mock-gateway.cjs', '3001'], {
  cwd: root,
  shell: true,
  stdio: 'inherit',
});

function waitForUrl(url, timeoutMs = 60000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http
        .get(url, (res) => {
          resolve(true);
        })
        .on('error', () => {
          if (Date.now() - start > timeoutMs) {
            reject(new Error(`Timeout waiting for ${url}`));
          } else {
            setTimeout(check, 500);
          }
        });
    };
    check();
  });
}

Promise.all([
  waitForUrl('http://localhost:3000'),
  waitForUrl('http://localhost:3001'),
])
  .then(() => {
    log('Both dev server and mock gateway are up');
    // Keep the process running while child processes run
    process.stdin.resume();
  })
  .catch((err) => {
    console.error('[dev-with-mock] Error waiting for services:', err);
    process.exit(1);
  });

process.on('SIGINT', () => {
  log('Shutting down children');
  dev.kill('SIGINT');
  mock.kill('SIGINT');
  process.exit(0);
});

process.on('exit', () => {
  try {
    dev.kill();
  } catch (e) {}
  try {
    mock.kill();
  } catch (e) {}
});
