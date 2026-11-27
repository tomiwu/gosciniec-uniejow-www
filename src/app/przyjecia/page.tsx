import Link from 'next/link';
import { FaqList } from '@/components/FaqList';
import { JsonLd } from '@/components/JsonLd';
import { Picture } from '@/components/Picture';
import { PlaceholderBadge } from '@/components/PlaceholderBadge';
import { SylwesterTeaser } from '@/components/SylwesterTeaser';
import { ballroomPlaceholder } from '@/content/placeholders';
import styles from '../venue.module.css';
import { buildFaqSchema } from '@/lib/faq';
import { routeMetadata } from '@/lib/metadata';
import { buildBallroomSchema } from '@/lib/schema/venue';
import { contact, sylwester } from '@/lib/venue';
import { partiesFaq } from '@/lib/venue-faq';

const path = '/przyjecia/';

export const metadata = routeMetadata(path);

const GALLERY_SIZES = '(min-width: 48rem) 270px, 100vw';

const photos = [
  {
    slug: 'dsc0e8152',
    alt: 'Sala balowa z żyrandolami, nakrytymi stołami i krzesłami w złotym kolorze',
  },
  {
    slug: 'img-0428',
    alt: 'Długi stół weselny z białymi obrusami, świecznikami i krzesłami w pokrowcach',
  },
  {
    slug: 'img-2002',
    alt: 'Długi stół w sali z balonami, zielonymi serwetkami i krzesłami w białych pokrowcach',
  },
  {
    slug: 'img-2616',
    alt: 'Nakryty stół przyjęcia z balonami i balonem w kształcie cyfry 3 przy oknie',
  },
  {
    slug: 'dsc0e3968',
    alt: 'Goście przy stole z owocami podczas przyjęcia w sali hotelu',
  },
] as const;

export default function Page() {
  return (
    <div className="page">
      <JsonLd data={buildBallroomSchema()} />
      <JsonLd data={buildFaqSchema(partiesFaq)} />

      <h1>Przyjęcia i sala balowa w Uniejowie</h1>
      <p className="lead">
        Niezapomniane chwile dla Ciebie i Twoich Gości. Gościniec Uniejów organizuje wesela,
        chrzciny, jubileusze i spotkania firmowe. Za nami ponad 30 lat doświadczenia w organizacji
        przyjęć.
      </p>

      <ul className={styles.gallery} aria-label="Zdjęcia sali balowej i przyjęć">
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

      <section aria-labelledby="sala-balowa">
        <h2 id="sala-balowa">Sala balowa</h2>
        <p>
          Hotel ma odnowioną salę balową. Malowniczy ogród i wnętrza hotelu tworzą tło dla
          najważniejszych chwil. Chcemy, aby każda uroczystość była wyjątkowa, od dużego wesela po
          przyjęcie w gronie najbliższych.
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>Sala balowa, bankiet</dt>
            <dd>
              do {ballroomPlaceholder.sampleCapacity} osób <PlaceholderBadge />
            </dd>
          </div>
        </dl>
        <p>
          Liczba jest przykładowa. <span className="todo">TODO: potwierdzić pojemność sali</span>{' '}
          Prawdziwą pojemność podamy w odpowiedzi na zapytanie.
        </p>
        <p>
          Na Sylwestra 2026/2027 sala balowa zaprasza na{' '}
          <Link href={sylwester.path}>bal sylwestrowy</Link>.
        </p>
      </section>

      <section aria-labelledby="rodzaje">
        <h2 id="rodzaje">Jakie przyjęcia organizujemy</h2>
        <ul>
          <li>wesela,</li>
          <li>chrzciny,</li>
          <li>jubileusze,</li>
          <li>spotkania firmowe,</li>
          <li>
            Sylwester: <Link href={sylwester.path}>{sylwester.title}</Link>.
          </li>
        </ul>
        <p>
          Spotkania firmowe i szkolenia mają osobną stronę:{' '}
          <Link href="/konferencje/">Konferencje i szkolenia</Link>.
        </p>
      </section>

      <SylwesterTeaser headingId="sylwester" />

      <section aria-labelledby="noclegi">
        <h2 id="noclegi">Nocleg dla gości</h2>
        <p>
          Goście przyjęcia mogą zostać w hotelu na noc. <Link href="/pokoje/">Zobacz pokoje</Link>.
        </p>
      </section>

      <section aria-labelledby="zapytanie">
        <h2 id="zapytanie">Zapytaj o termin</h2>
        <p>
          Napisz na <a href={contact.mailto}>{contact.email}</a> albo zadzwoń:{' '}
          <a href={contact.tel}>{contact.phoneDisplay}</a>.
        </p>
        <p>
          <Link className="button" href="/rezerwacja/?temat=przyjecia">
            Wyślij zapytanie
          </Link>
        </p>
      </section>

      <section aria-labelledby="faq-przyjecia">
        <h2 id="faq-przyjecia">Pytania o przyjęcia</h2>
        <FaqList items={partiesFaq} />
      </section>
    </div>
  );
}
