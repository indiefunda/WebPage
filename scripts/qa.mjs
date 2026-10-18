import { chromium } from 'playwright-core';

const url = process.argv[2] || 'http://127.0.0.1:4321/';
const output = process.argv[3] || '_research/home.png';
const width = Number(process.argv[4] || 1440);
const height = Number(process.argv[5] || 1000);
const full = process.argv[6] === 'full';

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
});

const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 1,
});

const errors = [];
page.on('pageerror', (error) => errors.push(`PAGE: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`CONSOLE: ${message.text()}`);
});

await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(700);

if (full) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  let y = 0;
  while (y < total) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(220);
    y += Math.round(height * 0.7);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
}

await page.screenshot({ path: output, fullPage: full });
console.log(
  JSON.stringify(
    {
      url,
      output,
      viewport: `${width}x${height}`,
      full,
      title: await page.title(),
      height: await page.evaluate(() => document.documentElement.scrollHeight),
      errors,
    },
    null,
    2,
  ),
);

await browser.close();
