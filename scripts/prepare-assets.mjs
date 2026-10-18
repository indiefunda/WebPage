import { readdir, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const sourceDir = path.join(root, 'art-source');
const outputDir = path.join(root, 'public', 'images', 'works');
const metaFile = path.join(root, 'src', 'data', 'images.json');
const widths = [480, 800, 1200, 1600];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const files = (await readdir(sourceDir))
  .filter((file) => file.toLowerCase().endsWith('.png'))
  .sort();

const images = {};

for (const file of files) {
  const key = path.basename(file, '.png');
  const input = path.join(sourceDir, file);

  // The 2026 photographs carry a thin dark rounded edge from the source
  // captures. Trim it so the drawings sit cleanly on the page.
  const inset = key.startsWith('2026-') ? 16 : 0;
  const sourceMeta = await sharp(input, { failOn: 'none' }).metadata();
  const croppedWidth = (sourceMeta.width ?? 1600) - inset * 2;
  const croppedHeight = (sourceMeta.height ?? 1600) - inset * 2;
  const maxWidth = croppedWidth;

  const pipeline = () => {
    let image = sharp(input, { failOn: 'none' }).rotate();
    if (inset) {
      image = image.extract({
        left: inset,
        top: inset,
        width: croppedWidth,
        height: croppedHeight,
      });
    }
    return image;
  };

  const availableWidths = widths.filter((width) => width <= maxWidth + 24);
  if (!availableWidths.includes(maxWidth) && maxWidth < 1600) {
    availableWidths.push(maxWidth);
  }

  const sources = [];

  for (const width of [...new Set(availableWidths)].sort((a, b) => a - b)) {
    const out = path.join(outputDir, `${key}-${width}.webp`);
    const info = await pipeline()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 87, effort: 5, smartSubsample: true })
      .toFile(out);
    sources.push({ width: info.width, height: info.height, path: `/images/works/${key}-${width}.webp` });
  }

  const largest = sources[sources.length - 1];

  const tiny = await pipeline()
    .resize({ width: 36 })
    .blur(1.2)
    .webp({ quality: 35 })
    .toBuffer();

  const { dominant } = await pipeline().stats();
  const color = `#${[dominant.r, dominant.g, dominant.b]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;

  images[key] = {
    width: largest.width,
    height: largest.height,
    ratio: Number((largest.width / largest.height).toFixed(5)),
    color,
    lqip: `data:image/webp;base64,${tiny.toString('base64')}`,
    sources,
    fallback: largest.path,
  };

  console.log(`Prepared ${key} — ${largest.width}×${largest.height}, ${sources.length} sizes`);
}

await writeFile(metaFile, `${JSON.stringify(images, null, 2)}\n`, 'utf8');
console.log(`\nWrote ${Object.keys(images).length} artwork records to ${path.relative(root, metaFile)}`);
