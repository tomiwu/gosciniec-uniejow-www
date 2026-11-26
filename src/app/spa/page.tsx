import { StubPage } from '@/components/StubPage';
import { routeMetadata } from '@/lib/metadata';

const path = '/spa/';

export const metadata = routeMetadata(path);

export default function Page() {
  return <StubPage path={path} />;
}
