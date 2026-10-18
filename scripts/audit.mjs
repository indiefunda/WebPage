import { chromium } from 'playwright-core';

const base = process.argv[2] || 'http://127.0.0.1:4321';
const pages = [
  '/',
  '/work',
  '/projects',
  '/projects/life-comes-in-circles',
  '/projects/your-roof-my-hut',
  '/projects/burn-wisdom-burn',
  '/bio',
  '/cv',
  '/contact',
];
const widths = [320, 390, 768, 1024, 1440, 1920];

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
});

const report = [];

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: width < 600 ? 844 : 1000 },
    isMobile: width < 600,
    hasTouch: width < 600,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });

  for (const path of pages) {
    errors.length = 0;
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);

    const info = await page.evaluate(() => {
      const html = document.documentElement;
      const missingAlt = [...document.images].filter((img) => !img.hasAttribute('alt')).length;
      const broken = [...document.images]
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.currentSrc);
      const h1s = [...document.querySelectorAll('h1')].map((h1) => h1.textContent.replace(/\s+/g, ' ').trim());
      const overflowing = [...document.querySelectorAll('body *')]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          if (style.position === 'fixed' || style.position === 'absolute') return false;
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          if (el.closest('.marquee, .filter-inner')) return false;
          return rect.right > html.clientWidth + 2 || rect.left < -2;
        })
        .slice(0, 8)
        .map((el) => `${el.tagName}.${typeof el.className === 'string' ? el.className : ''}`);
      return {
        title: document.title,
        overflow: html.scrollWidth - html.clientWidth,
        h1s,
        missingAlt,
        broken,
        overflowing,
      };
    });

    report.push({ width, path, ...info, errors: [...errors] });
  }

  await context.close();
}

await browser.close();

const problems = report.filter(
  (item) =>
    item.overflow > 1 ||
    item.errors.length ||
    item.broken.length ||
    item.missingAlt > 0 ||
    item.h1s.length !== 1 ||
    item.overflowing.length > 0,
);

console.log(`Checked ${report.length} page/width combinations.`);
if (!problems.length) {
  console.log('No layout, console, image, or heading issues detected.');
} else {
  console.log(JSON.stringify(problems, null, 2));
}
