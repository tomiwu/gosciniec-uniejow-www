import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { Picture } from '@/components/Picture';
import { routeMetadata } from '@/lib/metadata';
import { nap } from '@/lib/nap';
import { offers } from '@/lib/offers';
import { buildOffersSchema } from '@/lib/schema/offers';

const path = '/pakiety/';

export const metadata = routeMetadata(path);

const packageOffer = offers.find((offer) => offer.id === 'kobiecy-chill-fun');

/** The photo is 960 px wide. It fills the content column. */
const IMAGE_SIZES = '(min-width: 48rem) 44rem, 100vw';

export default function Page() {
  if (!packageOffer || packageOffer.price === null) {
    throw new Error('offers.ts needs the package with a real price.');
  }
  return (
    <div className="page packages">
      <h1>Pakiety pobytowe w Uniejowie</h1>
      <p className="lead">
        Weekend SPA w Uniejowie z noclegiem, kolacją i strefą wellness. Wybierz pakiet i zaplanuj
        wyjazd w hotelu Gościniec Uniejów.
      </p>

      <article className="package" aria-labelledby="pakiet-kobiecy">
        <Picture
          slug="kobiecy-weekend-uniejow"
          alt="Pakiet Kobiecy Chill & Fun: weekend relaksu w Uniejowie"
          sizes={IMAGE_SIZES}
          priority
        />
        <h2 id="pakiet-kobiecy">{packageOffer.name}</h2>
        <p>
          Wspólny wyjazd z przyjaciółką, siostrą lub mamą to dobry sposób na odpoczynek od
          codzienności. Pakiet „{packageOffer.name}” to weekend pełen rozmów, relaksu i przyjemności
          w Gościńcu Uniejów. Pakiet jest przeznaczony dla dwóch osób.
        </p>

        <h3>Co zawiera pakiet?</h3>
        <ul>
          <li>dwie noce w pokoju Deluxe,</li>
          <li>na powitanie schłodzone Prosecco i słodki upominek,</li>
          <li>śniadania w formie bufetu,</li>
          <li>kolację w restauracji hotelu, z zupą, sałatką i drinkiem na zakończenie,</li>
          <li>indywidualny masaż relaksacyjny dla każdej z Pań,</li>
          <li>strefę wellness: jacuzzi, saunę i siłownię,</li>
          <li>kawę lub herbatę i ciasto w restauracji, w wybrany dzień,</li>
          <li>
            karnety na jednorazowe wejście do Term Uniejów (karnet 2,5 godziny z dostępem do saun).
          </li>
        </ul>
        <p>
          Termy Uniejów to osobny, publiczny kompleks basenów termalnych, około 3 km od hotelu.
          Hotel nie ma basenów termalnych.
        </p>

        <p className="package__price">
          <strong>Cena pakietu: {packageOffer.price} zł / osoba</strong>
        </p>
        <p className="package__note">
          Aktualność oferty potwierdź w recepcji.{' '}
          <span className="todo">TODO: potwierdzić, czy pakiet jest nadal ważny</span>
        </p>
        <p>
          <Link className="button" href="/rezerwacja/">
            Rezerwuj
          </Link>{' '}
          Albo zadzwoń: <a href={`tel:${nap.phoneE164}`}>{nap.phoneDisplay}</a>
        </p>
      </article>

      <section aria-labelledby="oferta-swiateczna">
        <h2 id="oferta-swiateczna">Zapytaj o ofertę świąteczną</h2>
        <p>
          Planujesz święta poza domem? Zapytaj w recepcji o ofertę „Święta w Gościńcu”.{' '}
          <span className="todo">TODO: szczegóły i cena oferty świątecznej</span>
        </p>
        <p>
          Zadzwoń: <a href={`tel:${nap.phoneE164}`}>{nap.phoneDisplay}</a>
        </p>
      </section>

      <p>
        Szukasz ceny noclegu? Zobacz stronę <Link href="/ceny/">Ceny</Link>.
      </p>

      {buildOffersSchema(offers).map((offer, index) => (
        <JsonLd key={index} data={offer} />
      ))}
    </div>
  );
}
