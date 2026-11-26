import Link from 'next/link';
import { findRoute } from '@/lib/routes';
import { NapBlock } from './NapBlock';

/** Shared placeholder page. A later issue replaces it with real content. */
export function StubPage({ path }: { path: string }) {
  const route = findRoute(path);
  if (!route) throw new Error(`Unknown route: ${path}`);
  return (
    <main className="page">
      <h1>{route.title}</h1>
      <p>Treść strony w przygotowaniu.</p>
      <NapBlock />
      <p>
        <Link className="button" href="/rezerwacja/">
          Rezerwuj
        </Link>
      </p>
    </main>
  );
}
