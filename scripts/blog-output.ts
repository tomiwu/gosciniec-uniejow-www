import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { EMPTY_BLOG_SLUG, loadPosts } from '../src/lib/blog';

/**
 * Clean the blog part of the export folder.
 * - Remove the dummy slug folder (see `generateStaticParams` in `blog/[slug]/page.tsx`).
 * - Fail when a draft article has a page in the output.
 */
export function cleanBlogOutput(
  outDir: string,
  draftSlugs: readonly string[] = loadPosts(undefined, { includeDrafts: true })
    .filter((post) => post.draft)
    .map((post) => post.slug),
): void {
  rmSync(join(outDir, 'blog', EMPTY_BLOG_SLUG), { recursive: true, force: true });
  const leaked = draftSlugs.filter((slug) => existsSync(join(outDir, 'blog', slug)));
  if (leaked.length > 0) {
    throw new Error(`Draft blog article in the output: ${leaked.join(', ')}`);
  }
}
