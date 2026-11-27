import { RequestForm } from '@/components/form/RequestForm';
import { routeMetadata } from '@/lib/metadata';
import { nap } from '@/lib/nap';

const path = '/rezerwacja/';

export const metadata = routeMetadata(path);

export default function Page() {
  return (
    <div className="page">
      <h1>Rezerwacja – zapytanie o pobyt</h1>
      <p>
        Zadzwoń do recepcji, a ustalimy termin i szczegóły pobytu. Możesz też wysłać zapytanie przez
        formularz. Formularz nie rezerwuje pokoju. Potwierdzimy dostępność w odpowiedzi.
      </p>
      <p>
        <a className="button button--large" href={`tel:${nap.phoneE164}`}>
          Zadzwoń: {nap.phoneDisplay}
        </a>
      </p>
      <h2>Wyślij zapytanie</h2>
      <RequestForm kind="rezerwacja" />
    </div>
  );
}
