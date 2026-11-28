import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogArticle } from '@/components/BlogArticle';
import { EMPTY_BLOG_SLUG, getPublishedPosts } from '@/lib/blog';
import { TITLE_SUFFIX } from '@/lib/metadata';
import { nap } from '@/lib/nap';

type Params = { slug: string };

// Only published posts are built. A draft has no page in `out/`.
export const dynamicParams = false;

/**
 * `output: 'export'` fails on an empty list. While no post is published, one dummy slug keeps
 * the build alive. Its page is a 404 and `postbuild.ts` deletes its folder from `out/`.
 */
export function generateStaticParams(): Params[] {
  const posts = getPublishedPosts();
  if (posts.length === 0) return [{ slug: EMPTY_BLOG_SLUG }];
  return posts.map((post) => ({ slug: post.slug }));
}

function findPost(slug: string) {
  return getPublishedPosts().find((post) => post.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const post = findPost((await params).slug);
  if (!post) return {};
  const title = `${post.title} | ${TITLE_SUFFIX}`;
  return {
    title: { absolute: title },
    description: post.description,
    alternates: { canonical: post.path },
    openGraph: {
      type: 'article',
      locale: 'pl_PL',
      siteName: nap.name,
      title,
      description: post.description,
      url: post.path,
      publishedTime: post.date,
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const post = findPost((await params).slug);
  if (!post) notFound();
  return <BlogArticle post={post} />;
}
