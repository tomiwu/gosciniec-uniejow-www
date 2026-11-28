import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { nap } from '@/lib/nap';
import Privacy, { metadata as privacyMeta } from './polityka-prywatnosci/page';
import Terms, { metadata as termsMeta } from './regulamin/page';

describe.each([
  ['/regulamin/', Terms, termsMeta],
  ['/polityka-prywatnosci/', Privacy, privacyMeta],
] as const)('%s', (_path, Page, metadata) => {
  const html = renderToStaticMarkup(<Page />);

  it('has one h1, the lawyer placeholder and the NAP', () => {
    expect([...html.matchAll(/<h1[ >]/g)]).toHaveLength(1);
    expect(html).toContain('Treść przygotowuje prawnik.');
    expect(html).toContain(nap.name);
    expect(html).toContain(nap.street);
    expect(html).toContain(nap.phoneDisplay);
    expect(html).toContain(nap.email);
  });

  it('is noindex until the lawyer text exists', () => {
    expect(metadata.robots).toMatchObject({ index: false });
  });

  it('shows no TODO marker (a production build must pass)', () => {
    expect(html).not.toMatch(/\bTODO\b/);
  });
});

describe('/polityka-prywatnosci/ cookie list', () => {
  const html = renderToStaticMarkup(<Privacy />);

  it('lists the phase-1 cookies next to the lawyer placeholder', () => {
    expect(html).toContain('Krótka lista plików cookie');
    expect(html).toContain('cc_cookie');
    expect(html).toContain('gu-theme');
    expect(html).toContain('_ga');
  });
});
