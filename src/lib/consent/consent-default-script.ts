import { CONSENT_DEFAULTS } from '@/lib/consent/defaults';
import { hasGa4 } from '@/lib/consent/ga4';

/**
 * Inline script for `<head>`. It must run before any Google tag.
 * Returns null when the build has no GA4 ID.
 */
export function buildConsentDefaultScript(): string | null {
  if (!hasGa4) return null;
  const json = JSON.stringify(CONSENT_DEFAULTS);
  return (
    '(function(){window.dataLayer=window.dataLayer||[];' +
    'function gtag(){dataLayer.push(arguments);}window.gtag=gtag;' +
    `gtag('consent','default',${json});})();`
  );
}
