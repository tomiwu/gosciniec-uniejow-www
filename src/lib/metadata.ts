import type { Metadata } from 'next';
import { nap } from './nap';
import { findRoute } from './routes';

/** Site part of every `<title>`. */
export const TITLE_SUFFIX = `${nap.name} – hotel w Uniejowie`;

/** Next.js metadata for a route in `routes.ts`. */
export function routeMetadata(path: string): Metadata {
  const route = findRoute(path);
  if (!route) throw new Error(`Unknown route: ${path}`);
  const title = `${route.metaTitle} | ${TITLE_SUFFIX}`;
  return {
    title: { absolute: title },
    description: route.description,
    alternates: { canonical: path },
    ...(route.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: nap.name,
      title,
      description: route.description,
      url: path,
    },
  };
}

/** Metadata for a page that search engines must not index (for example a thank-you page). */
export function noindexMetadata(title: string, description: string): Metadata {
  return {
    title: { absolute: `${title} | ${TITLE_SUFFIX}` },
    description,
    robots: { index: false, follow: false },
  };
}
