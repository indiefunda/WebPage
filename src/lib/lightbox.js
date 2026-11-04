import images from '../data/images.json';

export const formatMeta = (work) =>
  [work.medium, work.dimensions, work.year].filter(Boolean).join(' · ');

export const lightboxAttrs = (work, project, href = `/works#${work.id}`) => {
  const image = images[work.image];

  if (!image) {
    throw new Error(`Missing image metadata for ${work.image}`);
  }

  return {
    href,
    'data-lightbox': '',
    'data-lightbox-src': image.fallback,
    'data-lightbox-srcset': image.sources
      .map((source) => `${source.path} ${source.width}w`)
      .join(', '),
    'data-lightbox-alt': work.alt,
    'data-lightbox-title': work.title,
    'data-lightbox-meta': formatMeta(work),
    'data-lightbox-project': `${project.number} / ${project.title}`,
    'data-lightbox-width': String(image.width),
    'data-lightbox-height': String(image.height),
  };
};
