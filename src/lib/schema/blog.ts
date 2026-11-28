import type { BlogPosting, WithContext } from 'schema-dts';
import type { BlogPost } from '../blog';
import { nap } from '../nap';

export type BlogPostingSchema = Exclude<WithContext<BlogPosting>, string>;

/** JSON-LD for one article. The author is the hotel, not a person. */
export function buildBlogPostingSchema(post: BlogPost): BlogPostingSchema {
  const url = `${nap.siteUrl}${post.path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: 'pl-PL',
    url,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: nap.name, url: nap.siteUrl },
  };
}
