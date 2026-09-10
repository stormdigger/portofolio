/**
 * Captures the page at several viewports and checks for horizontal overflow.
 * Usage: node scripts/shots.mjs [outputDir]
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const url = process.env.TEST_URL || 'http://localhost:4173';
const outDir = resolve(process.argv[2] || 'shots');

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'small', width: 320, height: 640 },
];

const SECTIONS = ['top', 'work', 'journey', 'toolbox', 'proof', 'contact'];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

const only = process.env.ONLY_VIEWPORT;
const problems = [];

for (const viewport of VIEWPORTS) {
  if (only && viewport.name !== only) continue;

  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => problems.push(`${viewport.name} page error: ${error.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`${viewport.name} console: ${msg.text()}`);
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);

  for (const id of SECTIONS) {
    await page.evaluate((sectionId) => {
      const el = document.getElementById(sectionId);
      window.scrollTo({ top: sectionId === 'top' ? 0 : el.offsetTop - 40, behavior: 'instant' });
    }, id);
    await page.waitForTimeout(650);
    await page.screenshot({ path: resolve(outDir, `${viewport.name}-${id}.png`) });

    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    if (overflow.scrollW > overflow.clientW + 1) {
      problems.push(`${viewport.name}/${id}: overflow ${overflow.scrollW} > ${overflow.clientW}`);
    }
  }

  // The project case-study dialog.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.click('[data-project]');
  await page.waitForTimeout(700);
  await page.screenshot({ path: resolve(outDir, `${viewport.name}-dialog.png`) });

  await context.close();
  console.log(`captured ${viewport.name}`);
}

await browser.close();

if (problems.length) {
  console.error('\nPROBLEMS:\n' + problems.join('\n'));
  process.exit(1);
}
console.log('\nClean: no overflow, no console errors.');
