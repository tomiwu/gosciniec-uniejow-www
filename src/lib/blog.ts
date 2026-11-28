import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Marked } from 'marked';

/** One blog article from `content/blog/<slug>.md`. */
export type BlogPost = {
  /** File name without `.md`. Part of the URL. */
  slug: string;
  /** Path with leading and trailing slash. */
  path: string;
  title: string;
  description: string;
  /** Publication date, `YYYY-MM-DD`. */
  date: string;
  draft: boolean;
  /** Reading time in whole minutes. At least 1. */
  readingMinutes: number;
  /** Article body as HTML. Rendered at build time. */
  html: string;
};

/** Dummy slug for the static build while no post is published. Not a real page. */
export const EMPTY_BLOG_SLUG = '_';

export const BLOG_DIR = join(process.cwd(), 'content', 'blog');

const WORDS_PER_MINUTE = 200;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export type FrontMatter = Record<string, string | boolean>;

function parseValue(raw: string): string | boolean {
  const value = raw.trim();
  if (value === 'true') return true;
  if (value === 'false') return false;
  const quote = value[0];
  if ((quote === '"' || quote === "'") && value.length >= 2 && value.endsWith(quote)) {
    return value.slice(1, -1);
  }
  return value;
}

/** Read the `key: value` block at the top of a Markdown file. Flat keys only. */
export function parseFrontMatter(source: string): { data: FrontMatter; body: string } {
  const match = FRONT_MATTER.exec(source);
  if (!match) throw new Error('Blog file needs a front matter block between --- lines.');
  const data: FrontMatter = {};
  for (const line of (match[1] ?? '').split(/\r?\n/)) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
    const colon = line.indexOf(':');
    if (colon <= 0) throw new Error(`Bad front matter line: "${line}"`);
    data[line.slice(0, colon).trim()] = parseValue(line.slice(colon + 1));
  }
  return { data, body: match[2] ?? '' };
}

export function readingTimeMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

const markdown = new Marked({
  walkTokens(token) {
    // The page has its own h1. A "#" in the body becomes h2, "##" becomes h3, and so on.
    if (token.type === 'heading') token.depth = Math.min(token.depth + 1, 6);
  },
  renderer: {
    // Drop raw HTML. The article is Markdown only.
    html: () => '',
  },
});

/** Render Markdown to HTML. Runs at build time only. */
export function renderMarkdown(source: string): string {
  return markdown.parse(source, { async: false });
}

function requireString(data: FrontMatter, key: string, file: string): string {
  const value = data[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${file}: front matter needs a non-empty ${key}.`);
  }
  return value;
}

function parsePost(slug: string, source: string): BlogPost {
  const file = `content/blog/${slug}.md`;
  if (!SLUG.test(slug)) throw new Error(`${file}: bad slug. Use a-z, 0-9 and hyphens.`);
  const { data, body } = parseFrontMatter(source);
  const date = requireString(data, 'date', file);
  if (!DATE.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    throw new Error(`${file}: date must be a real YYYY-MM-DD date.`);
  }
  const draft = data['draft'] ?? false;
  if (typeof draft !== 'boolean') throw new Error(`${file}: draft must be true or false.`);
  return {
    slug,
    path: `/blog/${slug}/`,
    title: requireString(data, 'title', file),
    description: requireString(data, 'description', file),
    date,
    draft,
    readingMinutes: readingTimeMinutes(body),
    html: renderMarkdown(body),
  };
}

/** Read the posts of a folder. Drafts are left out unless `includeDrafts` is true. Newest first. */
export function loadPosts(
  dir: string = BLOG_DIR,
  options: { includeDrafts?: boolean } = {},
): BlogPost[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => parsePost(name.slice(0, -3), readFileSync(join(dir, name), 'utf8')))
    .filter((post) => options.includeDrafts === true || !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/** Published posts of `content/blog/`. The only source for pages and the sitemap. */
export function getPublishedPosts(): BlogPost[] {
  return loadPosts();
}
