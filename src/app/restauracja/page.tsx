import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { PhotoGallery, type GalleryPhoto } from '@/components/PhotoGallery';
import { routeMetadata } from '@/lib/metadata';
import { nap } from '@/lib/nap';
import { buildRestaurantSchema } from '@/lib/schema/restaurant';

const path = '/restauracja/';

export const metadata = routeMetadata(path);

/** Photos of the old page `/restauracja/`. The alt text describes only what the photo shows. */
const photos: readonly GalleryPhoto[] = [
  {
    slug: 'dsc0e0107',
    alt: 'Sałatka z cukinią, rzodkiewką i pestkami dyni w niebieskiej misce, obok grzanka',
  },
  {
    slug: 'dsc0e0147',
    alt: 'Danie z surowego mięsa z żółtkiem i ziołami, obok kromki chleba i plastry sera',
  },
  {
    slug: 'dsc0e0185',
    alt: 'Kiełbasa z kapustą i gałązką rozmarynu na szarym talerzu',
  },
  {
    slug: 'dsc0e0193',
    alt: 'Danie z krewetkami, pomidorami i natką pietruszki w misce, obok chleb i cytryna',
  },
  {
    slug: 'dsc0e0297',
    alt: 'Pieczone mięso na kości z puree ziemniaczanym i kapustą na drewnianej desce',
  },
];

export default function Page() {
  return (
    <div className="page page--wide">
      <JsonLd data={buildRestaurantSchema()} />
      <h1>Restauracja w hotelu Gościniec Uniejów</h1>
      <p className="lead">
        Szukasz, gdzie zjeść obiad w Uniejowie? Restauracja Uniejów w hotelu Gościniec to miejsce,
        gdzie codziennie czekają lokalne przysmaki: świeże wypieki z miejscowej piekarni, wędliny i
        przetwory wyrabiane na miejscu, gorący żurek i dania z dziczyzny.
      </p>
      <p>
        Niespiesznie spróbujesz tu domowej szarlotki i aromatycznej kawy. Możesz też uczcić ważne
        chwile w gronie rodziny i przyjaciół.
      </p>

      <PhotoGallery photos={photos} label="Zdjęcia dań z restauracji" />

      <section className="page-section" aria-labelledby="kuchnia-title">
        <h2 id="kuchnia-title">Kuchnia</h2>
        <p>
          Podstawą dobrego smaku naszych potraw jest połączenie wieloletniej wiedzy i umiejętności
          szefowej kuchni z najświeższymi składnikami. Pozyskujemy je tylko od zaufanych dostawców.
        </p>
      </section>

      <section className="page-section" aria-labelledby="menu-title">
        <h2 id="menu-title">Menu</h2>
        <p className="menu-note">Aktualne menu wkrótce</p>
        <p>
          <span className="todo">TODO: aktualne menu (tekst lub PDF) od właściciela</span>
        </p>
        <p>
          Chcesz zapytać o dania? Zadzwoń: <a href={`tel:${nap.phoneE164}`}>{nap.phoneDisplay}</a>.
        </p>
        <p>
          <span className="todo">TODO: godziny otwarcia restauracji</span>
        </p>
      </section>

      <section className="page-section" aria-labelledby="sala-title">
        <h2 id="sala-title">Sala i ogród</h2>
        <p>
          Restauracja ma przestronną, stylowo urządzoną salę z bezpośrednim wyjściem do malowniczego
          ogrodu i altany grillowej. To dobre miejsce na wszelkiego rodzaju uroczystości. Wyjątkowa
          atmosfera stworzy niezapomniane tło dla Twojego wydarzenia.
        </p>
        <p>
          Zobacz <Link href="/przyjecia/">ofertę przyjęć</Link>.
        </p>
      </section>

      <section className="page-section" aria-labelledby="pobyt-title">
        <h2 id="pobyt-title">Obiad i nocleg w Uniejowie</h2>
        <p>
          Zjedz obiad w restauracji i zostań w hotelu. Zobacz <Link href="/pokoje/">pokoje</Link>{' '}
          oraz <Link href="/spa/">strefę SPA i wellness</Link>.
        </p>
        <p>
          <Link className="button" href="/rezerwacja/">
            Rezerwuj
          </Link>
        </p>
      </section>
    </div>
  );
}
