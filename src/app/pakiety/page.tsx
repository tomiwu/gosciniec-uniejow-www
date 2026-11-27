import Link from 'next/link';
import { FaqList } from '@/components/FaqList';
import { JsonLd } from '@/components/JsonLd';
import { PLACEHOLDER_BADGE, placeholderPackages } from '@/content/placeholders';
import { sylwesterBookingSlug } from '@/lib/form/booking-offers';
import { routeMetadata } from '@/lib/metadata';
import { buildFaqSchema } from '@/lib/faq';
import { offerFaq } from '@/lib/offer-faq';
import { offers } from '@/lib/offers';
import { sylwester as sylwesterFacts } from '@/lib/venue';

const path = '/pakiety/';

export const metadata = routeMetadata(path);

const sylwester = offers.find((offer) => offer.id === 'sylwester-2026');

export default function Page() {
  if (!sylwester || sylwester.price === null) {
    throw new Error('offers.ts needs the Sylwester offer with a price.');
  }
  return (
    <div className="page packages">
      <JsonLd data={buildFaqSchema(offerFaq)} />
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
              <li>Muzyka: {sylwesterFacts.dj}.</li>
              <li>Podana cena dotyczy balu, za parę.</li>
              <li>Nocleg i menu: na zapytanie.</li>
            </ul>
            <p className="package-card__price">
              <strong>{sylwester.price} zł za parę</strong> (bal)
            </p>
            <p>
              <Link className="button" href={sylwesterFacts.path}>
                Zobacz szczegóły balu
              </Link>
            </p>
            <p>
              <Link className="button" href={`/rezerwacja/?pakiet=${sylwesterBookingSlug}`}>
                Zapytaj o Sylwestra
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
                <Link className="button" href={`/rezerwacja/?pakiet=${item.id}`}>
                  {item.linkLabel}
                </Link>
              </p>
            </article>
          </li>
        ))}
      </ul>

      <section className="page-section" aria-labelledby="pakiety-pytania">
        <h2 id="pakiety-pytania">Pytania o pakiety i oferty</h2>
        <FaqList items={offerFaq} />
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
    </div>
  );
}
