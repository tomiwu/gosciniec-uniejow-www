/**
 * Preview build for GitHub Pages (https://tomiwu.github.io/gosciniec-uniejow-www/).
 * Only the workflow .github/workflows/preview-pages.yml sets these variables.
 * The production build for webd.pl has no base path and no preview marks.
 */
export const isPreview = process.env.NEXT_PUBLIC_PREVIEW === '1';

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Prefix a site-absolute path with the base path. Other values stay the same. */
export function withBase(path: string, base: string = basePath): string {
  return path.startsWith('/') && !path.startsWith('//') ? `${base}${path}` : path;
}
