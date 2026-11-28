import Link from 'next/link';
import { RequestForm } from '@/components/form/RequestForm';
import { NapBlock } from '@/components/NapBlock';
import { routeMetadata } from '@/lib/metadata';
import { nap } from '@/lib/nap';
import { salesEmail } from '@/lib/venue';

const path = '/kontakt/';

export const metadata = routeMetadata(path);

const mapsUrl =
  'https://www.google.com/maps/search/?api=1&query=Go%C5%9Bciniec+Uniej%C3%B3w+Sienkiewicza+137';

export default function Page() {
  return (
    <div className="page">
      <h1>Kontakt</h1>

      <section aria-labelledby="dane-kontaktowe">
        <h2 id="dane-kontaktowe">Dane kontaktowe</h2>
        <p>
          Chcesz zapytać o pobyt? <Link href="/rezerwacja/">Przejdź do rezerwacji</Link>. Zobacz też{' '}
          <Link href="/pakiety/">pakiety</Link>, <Link href="/konferencje/">konferencje</Link> i{' '}
          <Link href="/przyjecia/">przyjęcia</Link>.
        </p>
        <div className="contact-items">
          <p data-contact-item>
            Zapytania o wydarzenia, konferencje i przyjęcia:{' '}
            <a href={`mailto:${salesEmail}`}>{salesEmail}</a>
          </p>
          <NapBlock stacked />
          <div data-contact-item>
            <a className="button" href={`tel:${nap.phoneE164}`}>
              Zadzwoń: {nap.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="dojazd">
        <h2 id="dojazd">Dojazd</h2>
        <p>
          Hotel leży w Uniejowie, 50 km od Łodzi, 150 km od Warszawy i 12 km od autostrady A2. Do
          centrum miasta i do Term Uniejów jest około 3 km.
        </p>
        <p>
          <a href={mapsUrl}>Otwórz w Mapach Google</a>
        </p>
      </section>

      <section aria-labelledby="parking-i-recepcja">
        <h2 id="parking-i-recepcja">Parking i godziny recepcji</h2>
        <p>
          <span className="todo">
            TODO: parking (miejsca, opłaty, lokalizacja) – dane od właściciela
          </span>
        </p>
        <p>
          <span className="todo">
            TODO: godziny recepcji oraz zameldowania i wymeldowania – dane od właściciela
          </span>
        </p>
        <p>
          Do czasu potwierdzenia tych informacji zadzwoń do recepcji:{' '}
          <a href={`tel:${nap.phoneE164}`}>{nap.phoneDisplay}</a>.
        </p>
      </section>

      <section aria-labelledby="napisz-do-nas">
        <h2 id="napisz-do-nas">Napisz do nas</h2>
        <RequestForm kind="kontakt" />
      </section>
    </div>
  );
}
