/**
 * GA4 measurement ID from the build (PRD Q21).
 * CI and local default builds leave this empty: no Google tag in HTML.
 */
const raw = process.env['NEXT_PUBLIC_GA4_ID'] ?? '';

export const ga4MeasurementId = raw.trim();

/** Accept only a GA4 ID shape so a typo does not load a wrong host. */
export function isValidGa4Id(id: string): boolean {
  return /^G-[A-Z0-9]+$/.test(id);
}

export const hasGa4 = isValidGa4Id(ga4MeasurementId);
