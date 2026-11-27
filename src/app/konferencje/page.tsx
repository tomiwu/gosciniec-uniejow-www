import Link from 'next/link';
import { FaqList } from '@/components/FaqList';
import { JsonLd } from '@/components/JsonLd';
import { Picture } from '@/components/Picture';
import { PlaceholderBadge } from '@/components/PlaceholderBadge';
import { ballroomPlaceholder, conferenceRoomsPlaceholder } from '@/content/placeholders';
import styles from '../venue.module.css';
import { buildFaqSchema } from '@/lib/faq';
import { routeMetadata } from '@/lib/metadata';
import { buildConferenceRoomsSchema } from '@/lib/schema/venue';
import { contact, equipment, layouts, sylwester } from '@/lib/venue';
import { conferenceFaq } from '@/lib/venue-faq';

const path = '/konferencje/';

export const metadata = routeMetadata(path);

/** The photos are 480 px wide. They sit in a grid of up to three columns. */
const GALLERY_SIZES = '(min-width: 48rem) 270px, 100vw';

const photos = [
  {
    slug: 'konferencje-uniejow-gosciniec',
    alt: 'Sala konferencyjna w układzie teatralnym: rzędy krzeseł, ekran i rzutnik',
  },
  {
    slug: 'konferencje-uniejow-gosciniec3',
    alt: 'Sala konferencyjna w układzie w podkowę: stoły ustawione w literę U, ekran na ścianie',
  },
  {
    slug: 'konferencje-uniejow-gosciniec2',
    alt: 'Sala szkoleniowa ze stołami w rzędach, flipchartem i rzutnikiem, z oknami na ogród',
  },
  {
    slug: 'konferencja-gosciniec',
    alt: 'Mała sala spotkań z jednym długim stołem, krzesłami i butelkami wody',
  },
] as const;

export default function Page() {
  return (
    <div className="page">
      <JsonLd data={buildConferenceRoomsSchema()} />
      <JsonLd data={buildFaqSchema(conferenceFaq)} />

      <h1>Konferencje i szkolenia w Uniejowie</h1>
      <p className="lead">
        Gościniec Uniejów leży w centrum Polski, blisko autostrady A2. Łatwo tu dojechać z Łodzi,
        Warszawy i Poznania. W jednym miejscu masz sale konferencyjne, noclegi, kuchnię i strefę SPA
        &amp; Wellness.
      </p>

      <ul className={styles.gallery} aria-label="Zdjęcia sal konferencyjnych">
        {photos.map((photo, index) => (
          <li key={photo.slug}>
            <Picture
              slug={photo.slug}
              alt={photo.alt}
              sizes={GALLERY_SIZES}
              priority={index === 0}
            />
          </li>
        ))}
      </ul>

      <section aria-labelledby="sale">
        <h2 id="sale">Sale konferencyjne i sala balowa</h2>
        <p>
          Hotel ma sale konferencyjne dla spotkań biznesowych, szkoleń i warsztatów. Do większych
          wydarzeń służy odnowiona sala balowa. Układ sali dopasujemy do charakteru wydarzenia.
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>Liczba sal konferencyjnych</dt>
            <dd>
              {conferenceRoomsPlaceholder.sampleRoomCount} <PlaceholderBadge />
            </dd>
          </div>
          <div>
            <dt>Największa sala konferencyjna</dt>
            <dd>
              do {conferenceRoomsPlaceholder.sampleCapacity} osób <PlaceholderBadge />
            </dd>
          </div>
          <div>
            <dt>Sala balowa, bankiet</dt>
            <dd>
              do {ballroomPlaceholder.sampleCapacity} osób <PlaceholderBadge />
            </dd>
          </div>
        </dl>
        <p>
          Liczby powyżej są przykładowe.{' '}
          <span className="todo">TODO: potwierdzić liczbę sal i pojemność</span> Prawdziwą pojemność
          podamy w odpowiedzi na zapytanie.
        </p>
        <p>
          Chcesz zorganizować przyjęcie lub bal? Zobacz stronę{' '}
          <Link href="/przyjecia/">Przyjęcia i sala balowa</Link>. Na Sylwestra 2026/2027 zapraszamy
          na <Link href={sylwester.path}>bal sylwestrowy w sali balowej</Link>.
        </p>
      </section>

      <section aria-labelledby="uklady">
        <h2 id="uklady">Układy sali i wyposażenie</h2>
        <h3>Układy sali</h3>
        <ul>
          {layouts.map((layout) => (
            <li key={layout.name}>
              <strong>{layout.name}</strong> – {layout.use}
            </li>
          ))}
        </ul>
        <h3>Wyposażenie sal</h3>
        <ul>
          {equipment.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="catering">
        <h2 id="catering">Catering i przerwy kawowe</h2>
        <p>
          Catering i obsługa przerw kawowych są dostępne na zapytanie. Kuchnia hotelu przygotowuje
          lekkie przekąski i bufety kawowe, regionalne dania polskiej kuchni oraz zestawy i
          bankiety. Menu i cenę ustalamy w ofercie indywidualnej.
        </p>
        <p>
          Więcej o kuchni hotelu: <Link href="/restauracja/">Restauracja</Link>.
        </p>
      </section>

      <section aria-labelledby="noclegi">
        <h2 id="noclegi">Noclegi i wellness dla uczestników</h2>
        <p>
          Uczestnicy mogą zostać w hotelu na noc. Hotel ma pokoje w kilku standardach i kameralną
          strefę SPA &amp; Wellness z jacuzzi, sauną fińską i siłownią. Termy Uniejów to osobny
          kompleks w mieście, około 3 km od hotelu. Hotel nie ma basenów termalnych.
        </p>
        <p>
          <Link href="/pokoje/">Zobacz pokoje</Link> i <Link href="/spa/">strefę SPA</Link>.
        </p>
      </section>

      <section aria-labelledby="zapytanie">
        <h2 id="zapytanie">Zapytaj o ofertę dla firmy</h2>
        <p>
          Przygotujemy propozycję dopasowaną do potrzeb Twojej firmy. Napisz na{' '}
          <a href={contact.mailto}>{contact.email}</a> albo zadzwoń:{' '}
          <a href={contact.tel}>{contact.phoneDisplay}</a>.
        </p>
        <p>
          <Link className="button" href="/rezerwacja/?temat=konferencje">
            Wyślij zapytanie
          </Link>
        </p>
      </section>

      <section aria-labelledby="faq-konferencje">
        <h2 id="faq-konferencje">Pytania o konferencje</h2>
        <FaqList items={conferenceFaq} />
      </section>
    </div>
  );
}
