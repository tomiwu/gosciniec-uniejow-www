import { nap } from './nap';
import { isPreview } from './preview';
import { routes } from './routes';

export function buildRobotsTxt(preview: boolean = isPreview): string {
  if (preview) return ['User-agent: *', 'Disallow: /', ''].join('\n');
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${nap.siteUrl}/sitemap.xml`, ''].join('\n');
}

export function buildSitemapXml(): string {
  const urls = routes.map((route) => `  <url><loc>${nap.siteUrl}${route.path}</loc></url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
