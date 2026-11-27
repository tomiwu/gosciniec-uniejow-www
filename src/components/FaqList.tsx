import Link from 'next/link';
import type { FaqItem } from '@/lib/faq';

/** Visible FAQ list. Same markup as `/faq/`. The answers are plain text, so crawlers read them. */
export function FaqList({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="faq__list">
      {items.map((item) => (
        <details key={item.id} className="faq__item" id={item.id}>
          <summary>{item.question}</summary>
          <div className="faq__answer">
            <p>{item.answer}</p>
            {item.todo ? (
              <p className="faq__todo">TODO: brak tego faktu w tekstach starej strony.</p>
            ) : null}
            {item.link ? (
              <p>
                <Link href={item.link.href}>{item.link.label}</Link>
              </p>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}
