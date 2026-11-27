import Link from 'next/link';
import { FaqList } from '@/components/FaqList';
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
      <FaqList items={faq} />
      <p>
        <Link className="button" href="/rezerwacja/">
          Rezerwuj
        </Link>
      </p>
    </div>
  );
}
