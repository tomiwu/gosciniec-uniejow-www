import Link from 'next/link';
import { nap } from '@/lib/nap';

/** Body of a thank-you page. The page after a sent form. */
export function ThankYou({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="page">
      <h1>{title}</h1>
      <p>{lead}</p>
      <p>
        Pilne sprawy załatw telefonicznie: <a href={`tel:${nap.phoneE164}`}>{nap.phoneDisplay}</a>.
      </p>
      <p>
        <Link className="button" href="/">
          Wróć na stronę główną
        </Link>
      </p>
    </div>
  );
}
