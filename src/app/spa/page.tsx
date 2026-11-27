import Link from 'next/link';
import { PhotoGallery, type GalleryPhoto } from '@/components/PhotoGallery';
import { routeMetadata } from '@/lib/metadata';

const path = '/spa/';

export const metadata = routeMetadata(path);

/** Photos of the old page `/spa/`. The alt text describes only what the photo shows. */
const photos: readonly GalleryPhoto[] = [
  {
    slug: 'foto-5-1',
    alt: 'Czarne jacuzzi z niebieskim podświetleniem, a za nim sauna fińska i leżaki w jasnym wnętrzu',
  },
  {
    slug: 'foto-6-1',
    alt: 'Drewniany leżak przed oknem tarasowym obok sauny fińskiej z piecem na kamienie',
  },
  {
    slug: 'foto-4-1',
    alt: 'Wanna z hydromasażem w jasnej łazience SPA, w której odpoczywa kobieta',
  },
  {
    slug: 'foto-2-1',
    alt: 'Siłownia hotelowa z atlasem do ćwiczeń, bieżnią i rowerkami treningowymi',
  },
  {
    slug: 'img-e5609',
    alt: 'Siłownia hotelowa z bieżniami, orbitrekiem i sprzętem do ćwiczeń siłowych',
  },
];

export default function Page() {
  return (
    <div className="page page--wide">
      <h1>SPA i wellness w hotelu Gościniec Uniejów</h1>
      <p className="lead">
        Odpręż się! Hotel SPA Uniejów to kameralna strefa SPA &amp; Wellness, w której każda chwila
        jest poświęcona na relaks i odnowę. Zanurz się w jacuzzi, oddychaj głęboko podczas
        aromaterapii w wannie z hydromasażem i odkryj moc odprężenia w saunie fińskiej.
      </p>

      <PhotoGallery photos={photos} label="Zdjęcia strefy SPA i wellness" />

      <section className="page-section" aria-labelledby="strefa-title">
        <h2 id="strefa-title">Co ma strefa wellness</h2>
        <ul>
          <li>jacuzzi,</li>
          <li>wanna z hydromasażem i aromaterapia,</li>
          <li>sauna fińska,</li>
          <li>siłownia.</li>
        </ul>
        <p>
          Sauna fińska pozwala uwolnić ciało od napięć dnia codziennego. Siłownia jest dla gości,
          którzy chcą poprawić formę w czasie pobytu.
        </p>
      </section>

      <section className="page-section" aria-labelledby="masaze-title">
        <h2 id="masaze-title">Masaże i zabiegi</h2>
        <p>
          W ofercie wellness jest szeroki wybór masaży i zabiegów, które łączą relaksację z
          pielęgnacją. Pozwól nam zadbać o Twoje ciało i duszę.
        </p>
        <p>
          <span className="todo">
            TODO: lista masaży i zabiegów, ceny i godziny – dane od właściciela
          </span>
        </p>
      </section>

      <section className="page-section" aria-labelledby="dostep-title">
        <h2 id="dostep-title">Kto korzysta ze strefy wellness</h2>
        <p>
          Spa Uniejów, nocleg i wellness w jednym miejscu: wybierz pokój w hotelu i zobacz, kto ma
          dostęp do strefy.
        </p>
        <ul>
          <li>Pokój typu superior: nieograniczony dostęp do strefy Wellness w czasie pobytu.</li>
          <li>Pokój Deluxe w standardzie 3*: dostęp do strefy Wellness w cenie pokoju.</li>
          <li>Rodzinny Apartament: dostęp do strefy Wellness w cenie noclegu.</li>
        </ul>
        <p>
          <span className="todo">
            TODO: dostęp do strefy Wellness dla gości pokoju typu standard – brak informacji na
            starej stronie
          </span>
        </p>
        <p>
          Zobacz <Link href="/pokoje/">pokoje hotelu</Link> albo{' '}
          <Link href="/pakiety/">pakiety pobytowe</Link>. Strefa wellness jest też częścią pakietu
          „Kobiecy Chill &amp; Fun”.
        </p>
      </section>

      <section className="page-section" aria-labelledby="termy-title">
        <h2 id="termy-title">Termy Uniejów obok hotelu</h2>
        <p>
          Hotel ma własną strefę wellness, ale nie ma basenów termalnych. Termy Uniejów to osobny,
          publiczny kompleks basenowy, około 3 km od hotelu. Możesz go odwiedzić w czasie pobytu i
          poczuć siłę ciepła wód termalnych.
        </p>
        <p>
          Zobacz też <Link href="/atrakcje/">atrakcje w Uniejowie i okolicy</Link>.
        </p>
      </section>

      <section className="page-section" aria-labelledby="rezerwacja-title">
        <h2 id="rezerwacja-title">Zaplanuj odpoczynek w Uniejowie</h2>
        <p>Wyślij zapytanie o termin albo zadzwoń. Odpoczynek w Uniejowie czeka na Ciebie.</p>
        <p>
          <Link className="button" href="/rezerwacja/">
            Rezerwuj
          </Link>
        </p>
      </section>
    </div>
  );
}
