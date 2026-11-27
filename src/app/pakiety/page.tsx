import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { PLACEHOLDER_BADGE, placeholderPackages } from '@/content/placeholders';
import { routeMetadata } from '@/lib/metadata';
import { nap } from '@/lib/nap';
import { offers } from '@/lib/offers';
import { buildOffersSchema } from '@/lib/schema/offers';

const path = '/pakiety/';

export const metadata = routeMetadata(path);

const sylwester = offers.find((offer) => offer.id === 'sylwester-2026');

export default function Page() {
  if (!sylwester || sylwester.price === null) {
    throw new Error('offers.ts needs the Sylwester offer with a price.');
  }
  return (
    <div className="page packages">
      <h1>Pakiety i oferty w Uniejowie</h1>
      <p className="lead">
        Aktualne oferty hotelu Gościniec Uniejów: bal sylwestrowy i pakiety pobytowe. Przy każdej
        ofercie znajdziesz krótki opis, cenę, gdy ją znamy, i link do szczegółów.
      </p>

      <ul className="package-list">
        <li>
          <article className="package-card" aria-labelledby="oferta-sylwester">
            <p className="package-card__tag">Oferta sezonowa</p>
            <h2 id="oferta-sylwester">Bal Sylwestrowy – Sylwester 2026/2027</h2>
            <p className="package-card__audience">
              Dla gości, którzy chcą powitać Nowy Rok w Uniejowie: 31.12.2026 (czwartek), odnowiona
              sala balowa.
            </p>
            <ul>
              <li>Podana cena dotyczy balu, za parę.</li>
              <li>Nocleg i menu: na zapytanie.</li>
            </ul>
            <p className="package-card__price">
              <strong>{sylwester.price} zł za parę</strong> (bal)
            </p>
            <p>
              <Link className="button" href="#sylwester-szczegoly">
                Zobacz szczegóły balu
              </Link>
            </p>
          </article>
        </li>
        {placeholderPackages.map((item) => (
          <li key={item.id}>
            <article className="package-card" aria-labelledby={`oferta-${item.id}`}>
              <p className="package-card__tag">
                <span className="test-badge">{PLACEHOLDER_BADGE}</span>
              </p>
              <h2 id={`oferta-${item.id}`}>{item.name}</h2>
              <p className="package-card__audience">{item.audience}</p>
              <ul>
                {item.inclusions.map((inclusion) => (
                  <li key={inclusion}>{inclusion}</li>
                ))}
              </ul>
              <p className="package-card__price">{item.priceText}</p>
              <p>
                <Link className="button" href={item.path}>
                  {item.linkLabel}
                </Link>
              </p>
            </article>
          </li>
        ))}
      </ul>

      <section className="page-section" id="sylwester-szczegoly" aria-labelledby="sylwester-title">
        <h2 id="sylwester-title">Bal Sylwestrowy 2026/2027 – szczegóły</h2>
        <ul>
          <li>Termin: 31.12.2026 (czwartek).</li>
          <li>Miejsce: odnowiona sala balowa w hotelu, {nap.street}, Uniejów.</li>
          <li>Muzyka: DJ Letsky.</li>
          <li>
            Cena balu: {sylwester.price} zł za parę. Cena dotyczy balu. Nocleg i menu są na
            zapytanie.
          </li>
          <li>Dojazd: łatwy dojazd z autostrady A2 i drogi S8.</li>
        </ul>
        <p>Chcesz zostać na noc? Zapraszamy. Zapytaj o nocleg i menu.</p>
        <p>
          1 stycznia rano możesz zregenerować siły w pobliskich Termach Uniejów. Wstęp do Term nie
          jest w cenie balu.
        </p>
        <p>
          Zadzwoń: <a href={`tel:${nap.phoneE164}`}>{nap.phoneDisplay}</a> albo napisz:{' '}
          <a href={`mailto:${nap.email}`}>{nap.email}</a>.
        </p>
        <p>
          <Link className="button" href="/rezerwacja/">
            Zapytaj o Sylwestra
          </Link>
        </p>
      </section>

      <section className="page-section" aria-labelledby="pakiety-wiecej">
        <h2 id="pakiety-wiecej">Zobacz też</h2>
        <ul>
          <li>
            <Link href="/ceny/">Ceny noclegów</Link> – jak poznać cenę pokoju.
          </li>
          <li>
            <Link href="/rezerwacja/">Rezerwacja</Link> – zapytanie o termin albo telefon do
            recepcji.
          </li>
          <li>
            <Link href="/faq/">Pytania i odpowiedzi</Link> – najczęstsze pytania gości.
          </li>
          <li>
            <Link href="/atrakcje/">Atrakcje w Uniejowie</Link> – pomysły na wolny czas.
          </li>
          <li>
            <Link href="/przyjecia/">Przyjęcia i wesela</Link> – sala balowa na uroczystości.
          </li>
        </ul>
        <p>
          Termy Uniejów to osobny, publiczny kompleks, około 3 km od hotelu. Hotel ma strefę
          wellness (jacuzzi, saunę fińską i siłownię), ale nie ma basenów termalnych.
        </p>
      </section>

      {buildOffersSchema(offers).map((offer, index) => (
        <JsonLd key={index} data={offer} />
      ))}
    </div>
  );
}
