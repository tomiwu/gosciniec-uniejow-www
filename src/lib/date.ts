const MONTHS = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
];

/** `2026-12-01` becomes `1 grudnia 2026`. Fixed table, so the build does not depend on ICU data. */
export function formatDatePl(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const name = MONTHS[(month ?? 0) - 1];
  if (!year || !day || !name) throw new Error(`Bad date: ${isoDate}`);
  return `${day} ${name} ${year}`;
}
