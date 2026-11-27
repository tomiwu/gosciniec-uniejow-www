import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { buildFaqSchema, faq } from '@/lib/faq';
import { routeMetadata } from '@/lib/metadata';
import { nap } from '@/lib/nap';

const path = '/faq/';

export const metadata = routeMetadata(path);

export default function Page() {
  return (
    <div className="page faq">
      <JsonLd data={buildFaqSchema()} />
      <h1>Najczęstsze pytania</h1>
      <p>
        Odpowiedzi na pytania gości hotelu Gościniec Uniejów. Nie znalazłeś odpowiedzi? Zadzwoń do
        recepcji: <a href={`tel:${nap.phoneE164}`}>{nap.phoneDisplay}</a>.
      </p>
      <div className="faq__list">
        {faq.map((item) => (
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
      <p>
        <Link className="button" href="/rezerwacja/">
          Rezerwuj
        </Link>
      </p>
    </div>
  );
}
