import { NapBlock } from '@/components/NapBlock';
import { findRoute } from '@/lib/routes';

/** Placeholder of a legal page. A lawyer writes the text (PRD). The page is `noindex` until then. */
export function LegalPlaceholder({ path }: { path: string }) {
  const route = findRoute(path);
  if (!route) throw new Error(`Unknown route: ${path}`);
  return (
    <div className="page">
      <h1>{route.title}</h1>
      <p>Treść przygotowuje prawnik.</p>
      <NapBlock />
    </div>
  );
}
