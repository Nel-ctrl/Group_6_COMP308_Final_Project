import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const viteBin = join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
const remoteEntry = join(process.cwd(), 'dist', 'assets', 'remoteEntry.js');

if (!existsSync(viteBin)) {
  console.error('Vite is not installed for this remote. Run npm install first.');
  process.exit(1);
}

const children = new Set();
let stopping = false;

function spawnVite(args) {
  const child = spawn(process.execPath, [viteBin, ...args], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: false,
  });

  children.add(child);
  child.on('exit', (code) => {
    children.delete(child);
    if (!stopping && code !== 0) {
      stopAll();
      process.exit(code ?? 1);
    }
  });

  return child;
}

function stopAll() {
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
}

async function waitForRemoteEntry() {
  const startedAt = Date.now();
  while (!existsSync(remoteEntry)) {
    if (Date.now() - startedAt > 30000) {
      throw new Error('Timed out waiting for dist/assets/remoteEntry.js');
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});

console.log('Building remote bundle in watch mode...');
spawnVite(['build', '--watch']);

try {
  await waitForRemoteEntry();
  console.log('Serving built remoteEntry.js from dist...');
  spawnVite(['preview', '--host', '0.0.0.0']);
} catch (error) {
  console.error(error.message);
  stopAll();
  process.exit(1);
}
