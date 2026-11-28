import { LegalPlaceholder } from '@/components/LegalPlaceholder';
import { routeMetadata } from '@/lib/metadata';

const path = '/polityka-prywatnosci/';

// A lawyer has not written the text yet. Remove `noindex` from routes.ts when the text exists.
export const metadata = routeMetadata(path);

export default function Page() {
  return <LegalPlaceholder path={path} />;
}
