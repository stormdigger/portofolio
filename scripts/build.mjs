import { mkdir, copyFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
const output = resolve(root, 'dist');

const MODULES = ['app.js', 'beats.js', 'data.js', 'diagrams.js', 'motion.js', 'world.js'];
const FILES = [...MODULES, 'index.html', 'styles.css', 'resume.html'];

for (const name of MODULES) {
  execFileSync(process.execPath, ['--check', resolve(root, name)], { stdio: 'inherit' });
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const name of FILES) {
  await copyFile(resolve(root, name), resolve(output, name));
}

await cp(resolve(root, 'assets'), resolve(output, 'assets'), { recursive: true });

console.log(`Built static site in portofolio/dist (${FILES.length} files + assets).`);
