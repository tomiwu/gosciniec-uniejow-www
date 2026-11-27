import Link from 'next/link';
import { routeMetadata } from '@/lib/metadata';
import { nap } from '@/lib/nap';
import { rooms } from '@/lib/rooms';

const path = '/ceny/';

export const metadata = routeMetadata(path);

export default function Page() {
  return (
    <div className="page">
      <h1>Ceny noclegów w Uniejowie</h1>
      <p className="lead">
        Sprawdź, ile kosztuje nocleg w hotelu Gościniec Uniejów. Poniżej znajdziesz typy pokoi i
        informację, jak poznać aktualną cenę.
      </p>

      <table className="prices">
        <caption>Ceny pokoi w hotelu Gościniec Uniejów</caption>
        <thead>
          <tr>
            <th scope="col">Typ pokoju</th>
            <th scope="col">Cena od</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.slug}>
              <th scope="row">{room.name}</th>
              <td>
                {room.priceFrom === null ? (
                  <>
                    Zapytaj recepcję <span className="todo">TODO: cena od właściciela</span>
                  </>
                ) : (
                  <>{room.priceFrom} zł za noc</>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        Ceny zależą od terminu. Zadzwoń: <a href={`tel:${nap.phoneE164}`}>{nap.phoneDisplay}</a>
      </p>
      <p>
        <Link className="button" href="/rezerwacja/">
          Zapytaj o termin
        </Link>
      </p>

      <h2>Pakiety pobytowe</h2>
      <p>
        Szukasz oferty na Sylwestra albo na krótki pobyt? Zobacz{' '}
        <Link href="/pakiety/">pakiety i oferty</Link>.
      </p>
    </div>
  );
}
