import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { FaqItem } from '@/lib/faq';
import { FaqList } from './FaqList';

const real: FaqItem = { id: 'a', question: 'Pytanie A?', answer: 'Odpowiedź A.' };
const sample: FaqItem = {
  id: 'b',
  question: 'Pytanie B?',
  answer: 'Odpowiedź B.',
  isPlaceholder: true,
};

describe('FaqList', () => {
  it('shows the badge "Dane testowe" only on a placeholder item', () => {
    const html = renderToStaticMarkup(<FaqList items={[real, sample]} />);
    const [first, second] = html.split('<details').slice(1);
    expect(first).not.toContain('Dane testowe');
    expect(second).toContain('Dane testowe');
  });
});
