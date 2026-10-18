import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const imageDir = path.join(publicDir, 'images');
await mkdir(imageDir, { recursive: true });

const studio = path.join(root, 'art-source', 'studio.webp');

await sharp(studio)
  .resize({ width: 1600, withoutEnlargement: true })
  .jpeg({ quality: 84, progressive: true, mozjpeg: true })
  .toFile(path.join(imageDir, 'studio-1600.jpg'));

await sharp(studio)
  .resize({ width: 960, withoutEnlargement: true })
  .jpeg({ quality: 82, progressive: true, mozjpeg: true })
  .toFile(path.join(imageDir, 'studio-960.jpg'));

const favicon = path.join(publicDir, 'favicon.svg');

await sharp(favicon).resize(180, 180).png().toFile(path.join(imageDir, 'apple-touch-icon.png'));
await sharp(favicon).resize(192, 192).png().toFile(path.join(imageDir, 'icon-192.png'));
await sharp(favicon).resize(512, 512).png().toFile(path.join(imageDir, 'icon-512.png'));

const socialPanel = (lines, label, footer) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#f3efe6"/>
  <rect x="0" y="0" width="640" height="630" fill="#e8e1d3"/>
  <line x1="660" y1="55" x2="660" y2="575" stroke="#11110f" stroke-opacity=".18"/>
  <circle cx="1140" cy="78" r="7" fill="#eb4a2b"/>
  <text x="700" y="142" font-family="Arial, sans-serif" font-size="13" letter-spacing="3" fill="#696358">${label}</text>
  ${lines
    .map(
      (line, index) =>
        `<text x="700" y="${260 + index * 76}" font-family="Georgia, 'Times New Roman', serif" font-size="${line.length > 12 ? 56 : 64}" fill="#11110f">${line}</text>`,
    )
    .join('')}
  <line x1="700" y1="500" x2="1140" y2="500" stroke="#11110f" stroke-opacity=".2"/>
  <text x="700" y="540" font-family="Arial, sans-serif" font-size="13" letter-spacing="2.4" fill="#696358">${footer}</text>
  <text x="700" y="573" font-family="Arial, sans-serif" font-size="13" letter-spacing="2.4" fill="#696358">ATHENS, GREECE</text>
</svg>
`);

const covers = {
  default: {
    key: '2026-03',
    lines: ['Natalia', 'Afentoulidou'],
    label: 'ARTIST / ATHENS, GREECE',
    footer: 'DRAWING / INSTALLATION / MIXED MEDIA',
  },
  'life-comes-in-circles': {
    key: '2026-03',
    lines: ['Life comes', 'in circles'],
    label: 'PROJECT 01 / WORKS ON PAPER',
    footer: 'INK AND PENCIL ON PAPER / 2026',
  },
  'your-roof-my-hut': {
    key: 'B-08',
    lines: ['Your Roof,', 'My Hut'],
    label: 'PROJECT 02 / INSTALLATION',
    footer: 'MIXED MEDIA / DIMENSIONS VARIABLE',
  },
  'burn-wisdom-burn': {
    key: 'A-02',
    lines: ['Burn Wisdom', 'Burn'],
    label: 'PROJECT 03 / INSTALLATION',
    footer: 'MIXED MEDIA / DIMENSIONS VARIABLE',
  },
};

for (const [name, config] of Object.entries(covers)) {
  const art = await sharp(path.join(imageDir, 'works', `${config.key}-800.webp`))
    .resize(640, 630, { fit: 'cover', position: 'centre' })
    .toBuffer();

  const panel = socialPanel(config.lines, config.label, config.footer);

  await sharp(panel)
    .composite([{ input: art, left: 0, top: 0 }])
    .jpeg({ quality: 88, progressive: true, mozjpeg: true })
    .toFile(path.join(imageDir, `og-${name}.jpg`));
}

console.log('Prepared studio images, icons and social images.');
