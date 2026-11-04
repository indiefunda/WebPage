# Natalia Afentoulidou — Artist

A new website for the Athens-based artist Natalia Afentoulidou: drawing, installation and mixed media.

The site is built with Astro and ships as plain, fast, static HTML/CSS/JS. It is deliberately image-led, with an editorial exhibition-catalogue feel, and keeps the sections: **Home, Bio, Works, Contact**.

## Run it locally

```bash
npm install
npm run dev
```

Open the printed local URL (by default `http://127.0.0.1:4321`).

## Build for production

```bash
npm run build
npm run preview
```

The production files are written to `dist/`. `netlify.toml` is included, so the project can be connected to Netlify and deployed with:

- Build command: `npm run build`
- Publish directory: `dist`

The same `dist/` folder works on Vercel, Cloudflare Pages, or any static host. The site uses clean URLs (`/works`, `/works/life-comes-in-circles`), so the host should support pretty/extensionless URLs (Netlify and Vercel do by default). Old `/work` and `/projects` URLs redirect to `/works`.

## Where to edit content

| What | File |
| --- | --- |
| Artist name, email, location, default social text | `src/data/projects.js` (`site`) |
| Projects, artwork titles, materials, dimensions, alt text | `src/data/projects.js` |
| CV, shows, awards, press links | `src/data/cv.js` |
| Works index copy | `src/pages/works/index.astro` |
| Bio copy | `src/pages/bio.astro` |
| Contact copy | `src/pages/contact.astro` |
| Visual system, type, layout | `src/styles/global.css` |

### Project titles

**Life comes in circles** is the artist's title for the 2026 works on paper. The two older bodies of work are currently presented under editorial titles borrowed from signature works:

1. **Life comes in circles** — works on paper, 2026
2. **Your Roof, My Hut** — installation / mixed media
3. **Burn Wisdom Burn** — installation / mixed media

If the artist has official titles for the two older bodies of work, change `title` and `tabTitle` in `src/data/projects.js` and update the relevant sentences in the page copy.

One useful discovery from the audit: the local `Project A` and `Project B` folders are reversed relative to the live site's A/B project pages. The new site groups the works by their content, not by those folder labels.

### One artwork needs confirmation

The 2026 file delivered as `Screenshot 2026-10-17 at 18-50-35 Instagram.png` is a finished drawing, but the file carried no title or dimensions. It is currently published as **Untitled**. Update its `title` and `dimensions` in `src/data/projects.js` (id `ih-13`) when confirmed.

There is no Instagram or social profile in the current site content, so none was invented for the new site. Add the handle to the header/footer/contact when available.

## Artwork pipeline

- Original files supplied by the artist live in `Natalia/`.
- Working source files live in `art-source/` with stable names (`2026-01.png`, `A-02.png`, `B-08.png`, etc.).
- Responsive WebP renditions are generated into `public/images/works/`.
- `npm run assets` regenerates the renditions and `src/data/images.json`.

Two source clean-ups are intentional and encoded in the workflow:

- The 2026 photographs are trimmed by 16 px on each edge to remove a thin dark rounded edge from the original captures.
- `B-03` (I did it) was cropped by 72 px left/right to remove gallery carousel arrows that were baked into the source image.

If an image is replaced, keep the same image key, run `npm run assets`, and the page will pick up the new renditions automatically.

## CV

The CV has two forms:

- An online, screen-readable CV at `/cv` (`src/pages/cv.astro`, `src/styles/cv.css`).
- A designed three-page A4 PDF at `public/cv/Natalia-Afentoulidou-CV.pdf`, linked from the Bio and CV pages.

To regenerate the PDF after editing the CV data:

```bash
npm run cv
```

This builds the site, prints the CV page, and finalises the PDF. The finalisation step uses Python 3 and PyMuPDF (`pip install pymupdf`). The committed PDF is ready to use even without running this command.

## Firebase deployment

Live site: **https://natalia-afentoulidou.web.app**

- Firebase project: `natalia-afentoulidou`
- Plan: **Spark**  —  no billing account is attached to this project.
- The existing Blaze project (`keen-wavelet-275120`, the news app) was left untouched.
- Deploy again with `npm run deploy`.
- The site is indexable: `robots.txt` allows crawling and the sitemap is at `https://nataliaafentoulidou.com/sitemap-index.xml`. Submit that sitemap in Google Search Console and Bing Webmaster Tools after DNS is fully live.
- Free Spark Hosting includes 10 GB storage and 360 MB/day of data transfer. This build is about 15 MB of storage; testing traffic should fit comfortably, but the site will hard-stop at the free data limit rather than bill.
- The site is public to anyone with the link; Firebase Hosting on Spark does not provide password protection.

## Notes before going live

- This build is the live site; the old WordPress site is no longer served at the domain.
- Confirm the project titles and the Untitled work.
- Add an Instagram/social link if wanted.
- The CV is now a newly designed document; review the text against the old CV and confirm any details.
- All images remain © Natalia Afentoulidou.

## Search visibility and analytics

The site is indexable: `robots.txt` allows all crawlers and the sitemap is at `https://nataliaafentoulidou.com/sitemap-index.xml`.

Recommended free setup:

1. **Google Search Console** — add a Domain property for `nataliaafentoulidou.com`, verify with the DNS TXT record in Cloudflare, then submit the sitemap. Use URL Inspection to request indexing for the home page, Bio and the three works.
2. **Bing Webmaster Tools** — import the site from Search Console and submit the same sitemap.
3. **Cloudflare Web Analytics** — free and cookieless. Add the site in Cloudflare, then add the generated JS snippet to `src/layouts/BaseLayout.astro` before `</head>`.
4. **Google Analytics 4** — optional; only if a consent banner is added for EU visitors.

For SEO, the strongest signals are the artist/project texts, descriptive image alt text, backlinks from exhibition and press pages, and regular updates. Avoid keyword stuffing, cloaking, paid link schemes and hidden text.
