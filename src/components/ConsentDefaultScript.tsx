import { buildConsentDefaultScript } from '@/lib/consent/consent-default-script';

/** Inline Consent Mode defaults in head before any Google tag. */
export function ConsentDefaultScript() {
  const code = buildConsentDefaultScript();
  if (!code) return null;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
