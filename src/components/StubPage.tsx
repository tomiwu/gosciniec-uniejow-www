import { findRoute } from '@/lib/routes';

/** Shared placeholder page. A later issue replaces it with real content. */
export function StubPage({ path }: { path: string }) {
  const route = findRoute(path);
  if (!route) throw new Error(`Unknown route: ${path}`);
  return (
    <div className="page">
      <h1>{route.title}</h1>
      <p>Treść strony w przygotowaniu.</p>
    </div>
  );
}
