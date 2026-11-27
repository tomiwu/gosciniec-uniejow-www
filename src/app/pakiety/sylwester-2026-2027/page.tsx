import Link from 'next/link';
import { FaqList } from '@/components/FaqList';
import { Picture } from '@/components/Picture';
import { JsonLd } from '@/components/JsonLd';
import { buildFaqSchema } from '@/lib/faq';
import { routeMetadata } from '@/lib/metadata';
import { nap } from '@/lib/nap';
import { offerFaq } from '@/lib/offer-faq';
import { offers } from '@/lib/offers';
import { buildOffersSchema } from '@/lib/schema/offers';
import { sylwesterBookingSlug } from '@/lib/form/booking-offers';
import { contact, sylwester } from '@/lib/venue';

const path = sylwester.path;

export const metadata = routeMetadata(path);

const offer = offers.find((item) => item.id === 'sylwester-2026');

export default function Page() {
  if (!offer || offer.price === null || offer.path !== path) {
    throw new Error('offers.ts needs the Sylwester offer with a price and this path.');
  }
  const schema = buildOffersSchema([offer]);
  return (
    <div className="page packages">
      <p>
        <Link href="/pakiety/">← Wszystkie pakiety i oferty</Link>
      </p>
      <h1>{sylwester.title}</h1>
      <p className="lead">
        Powitaj Nowy Rok w Uniejowie. Bal sylwestrowy odbędzie się {sylwester.dateText} w odnowionej
        sali balowej hotelu Gościniec Uniejów.
      </p>

      <section className="page-section" aria-labelledby="sylwester-fakty">
        <h2 id="sylwester-fakty">Najważniejsze informacje</h2>
        <ul>
          <li>Termin: 31.12.2026 (czwartek).</li>
          <li>
            Miejsce: odnowiona sala balowa w hotelu, {nap.street}, {nap.city}.
          </li>
          <li>Muzyka: {sylwester.dj}.</li>
          <li>Dojazd: łatwy dojazd z autostrady A2 i drogi S8.</li>
        </ul>
        <figure className="sylwester-dj">
          <Picture
            slug="dj-letsky"
            alt="DJ Letsky przy konsoli – muzyka na balu sylwestrowym w Gościńcu Uniejów"
            sizes="(min-width: 48rem) 360px, 82vw"
          />
          <figcaption>Muzyka na balu: {sylwester.dj}.</figcaption>
        </figure>
      </section>

      <section className="page-section" aria-labelledby="sylwester-cena">
        <h2 id="sylwester-cena">Cena</h2>
        <p className="package-card__price">
          <strong>{offer.price} zł za parę</strong> (bal)
        </p>
        <p>Cena dotyczy balu, za parę. Nocleg i menu: na zapytanie.</p>
      </section>

      <section className="page-section" aria-labelledby="sylwester-nocleg">
        <h2 id="sylwester-nocleg">Nocleg i 1 stycznia</h2>
        <p>Chcesz zostać na noc? Zapraszamy. Zapytaj o nocleg w recepcji.</p>
        <p>
          1 stycznia rano możesz zregenerować siły w pobliskich Termach Uniejów. Termy to osobny,
          publiczny kompleks. Wstęp do Term nie jest w cenie balu.
        </p>
      </section>

      <section className="page-section" aria-labelledby="sylwester-kontakt">
        <h2 id="sylwester-kontakt">Zapytaj o Sylwestra</h2>
        <p>
          Zadzwoń: <a href={contact.tel}>{contact.phoneDisplay}</a> albo napisz:{' '}
          <a href={`mailto:${nap.email}`}>{nap.email}</a>. W sprawie przyjęć i balu pisz też na{' '}
          <a href={contact.mailto}>{contact.email}</a>.
        </p>
        <p>
          <Link className="button" href={`/rezerwacja/?pakiet=${sylwesterBookingSlug}`}>
            Zapytaj o Sylwestra
          </Link>
        </p>
      </section>

      <section className="page-section" aria-labelledby="sylwester-pytania">
        <h2 id="sylwester-pytania">Pytania o bal i oferty</h2>
        <FaqList items={offerFaq} />
      </section>

      <section className="page-section" aria-labelledby="sylwester-wiecej">
        <h2 id="sylwester-wiecej">Zobacz też</h2>
        <ul>
          <li>
            <Link href="/pakiety/">Pakiety i oferty</Link> – wszystkie aktualne oferty hotelu.
          </li>
          <li>
            <Link href="/przyjecia/">Przyjęcia i sala balowa</Link> – inne uroczystości w naszej
            sali.
          </li>
          <li>
            <Link href="/rezerwacja/">Rezerwacja</Link> – zapytanie o termin albo telefon do
            recepcji.
          </li>
        </ul>
      </section>

      <JsonLd data={buildFaqSchema(offerFaq)} />
      {schema.map((node, index) => (
        <JsonLd key={index} data={node} />
      ))}
    </div>
  );
}
