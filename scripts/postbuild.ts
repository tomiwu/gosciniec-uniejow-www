import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildLlmsTxt, buildRobotsTxt, buildSitemapXml } from '../src/lib/seo-files';
import { buildHtaccess } from '../src/redirects/htaccess';
import { redirects } from '../src/redirects/map';

const outDir = process.argv[2] ?? 'out';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, '.htaccess'), buildHtaccess(redirects));
writeFileSync(join(outDir, 'robots.txt'), buildRobotsTxt());
writeFileSync(join(outDir, 'sitemap.xml'), buildSitemapXml());
writeFileSync(join(outDir, 'llms.txt'), buildLlmsTxt());
console.log(`postbuild: wrote .htaccess, robots.txt, sitemap.xml, llms.txt to ${outDir}/`);
