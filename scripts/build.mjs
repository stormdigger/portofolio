import { mkdir, copyFile, cp, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
const output = resolve(root, 'dist');
for (const name of ['app.js','world.js','universe.js','data.js']) {
  execFileSync(process.execPath, ['--check', resolve(root, name)], { stdio: 'inherit' });
}
await mkdir(output, { recursive: true });
for (const name of ['index.html','styles.css','experience.css','app.js','world.js','universe.js','data.js','resume.html']) {
  await copyFile(resolve(root, name), resolve(output, name));
}
await cp(resolve(root, 'assets'), resolve(output, 'assets'), { recursive: true });
const image = await stat(resolve(output, 'assets/room.webp'));
console.log(`Built static site in portofolio/dist. Room image: ${Math.round(image.size / 1024)} KB.`);
