import type { Metadata } from 'next';
import { nap } from './nap';
import { findRoute } from './routes';

/** Next.js metadata for a route in `routes.ts`. */
export function routeMetadata(path: string): Metadata {
  const route = findRoute(path);
  if (!route) throw new Error(`Unknown route: ${path}`);
  return {
    title: path === '/' ? { absolute: nap.name } : route.title,
    description: route.description,
    alternates: { canonical: path },
  };
}
