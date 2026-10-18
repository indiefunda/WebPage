import { createServer } from 'node:http';
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const publicPdf = path.join(root, 'public', 'cv', 'Natalia-Afentoulidou-CV.pdf');
const distPdf = path.join(distDir, 'cv', 'Natalia-Afentoulidou-CV.pdf');
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const resolved = path.resolve(distDir, relative);

    if (!resolved.startsWith(path.resolve(distDir) + path.sep)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const candidates = [`${resolved}.html`, path.join(resolved, 'index.html'), resolved];
    let file = null;
    let body = null;

    for (const candidate of candidates) {
      try {
        const info = await stat(candidate);
        if (info.isFile()) {
          file = candidate;
          body = await readFile(candidate);
          break;
        }
      } catch {
        // Try the next candidate.
      }
    }

    if (!file || !body) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch {
    res.writeHead(500);
    res.end('Server error');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();

const browser = await chromium.launch({ executablePath: edge, headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1200 },
  deviceScaleFactor: 1,
  javaScriptEnabled: false,
});
const page = await context.newPage();

try {
  await page.goto(`http://127.0.0.1:${port}/cv`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(300);

  await mkdir(path.dirname(publicPdf), { recursive: true });
  await page.pdf({
    path: publicPdf,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: false,
    scale: 1,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    tagged: true,
    outline: true,
  });

  await mkdir(path.dirname(distPdf), { recursive: true });
  await copyFile(publicPdf, distPdf);

  const size = (await stat(publicPdf)).size;
  console.log(`Built ${path.relative(root, publicPdf)} (${Math.round(size / 1024)} KB)`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
