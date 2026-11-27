import Link from 'next/link';
import { PhotoGallery, type GalleryPhoto } from '@/components/PhotoGallery';
import { routeMetadata } from '@/lib/metadata';

const path = '/dla-dzieci/';

export const metadata = routeMetadata(path);

/** Photos of the old page `/dla-dzieci/`. The alt text describes only what the photo shows. */
const photos: readonly GalleryPhoto[] = [
  {
    slug: 'foto-12',
    alt: 'Dzieci bawią się na trawniku w ogrodzie hotelu, w tle plac zabaw i budynek hotelu',
  },
  {
    slug: 'foto-14',
    alt: 'Dmuchany zamek i plac zabaw z huśtawkami przed budynkiem hotelu',
  },
  {
    slug: 'foto-15',
    alt: 'Grupa dzieci w różowych koszulkach i kaskach jeździ na rolkach obok altany w ogrodzie',
  },
  {
    slug: 'foto-17',
    alt: 'Kolorowa dmuchana zjeżdżalnia na trawniku i plac zabaw w ogrodzie hotelu',
  },
];

export default function Page() {
  return (
    <div className="page page--wide">
      <h1>Uniejów z dziećmi – oferta dla rodzin</h1>
      <p className="lead">
        Rodzinne chwile w otoczeniu przyrody zdają się płynąć wolniej. Gościniec Uniejów to hotel
        przyjazny dzieciom, Uniejów z dala od miejskiego zgiełku. Czyste powietrze i bliskość
        przyrody pozwalają najmłodszym dostrzec, dlaczego należy się o nią troszczyć.
      </p>

      <PhotoGallery photos={photos} label="Zdjęcia ogrodu i placu zabaw" />

      <section className="page-section" aria-labelledby="ogrod-title">
        <h2 id="ogrod-title">Plac zabaw i zabawy w ogrodzie</h2>
        <p>
          Najmłodsi mogą korzystać z obszernego placu zabaw w ogrodzie. W ogrodzie jest miejsce na
          gry w piłkę, jazdę na rolkach i ekologiczne warsztaty.
        </p>
      </section>

      <section className="page-section" aria-labelledby="starsze-title">
        <h2 id="starsze-title">Dla starszych dzieci</h2>
        <p>
          Na starszych czeka boisko do siatkówki i ścieżki rowerowe, na których można spotkać dziką
          zwierzynę. Piknik na łące to dobre zwieńczenie takiej wyprawy i okazja do rozmów i zabaw.
        </p>
      </section>

      <section className="page-section" aria-labelledby="latem-title">
        <h2 id="latem-title">Latem: balia z ciepłą wodą</h2>
        <p>
          Latem cieszymy się atrakcją w postaci dużej balii z ciepłą wodą, którą uwielbiają dzieci.
          Po kąpielach serwujemy smakowite posiłki, przygotowane specjalnie dla najmłodszych. Zobacz{' '}
          <Link href="/restauracja/">restaurację</Link>.
        </p>
      </section>

      <section className="page-section" aria-labelledby="nocleg-title">
        <h2 id="nocleg-title">Nocleg dla rodziny</h2>
        <p>
          Dla rodzin jest Rodzinny Apartament: sypialnia z łożem małżeńskim i pokój dzienny z
          rozkładaną sofą, z możliwością dostawki. Zobacz <Link href="/pokoje/">pokoje</Link>.
        </p>
        <p>
          <span className="todo">
            TODO: zasady dla rodzin (łóżeczka, krzesełka, zniżki dla dzieci) – brak na starej
            stronie
          </span>
        </p>
      </section>

      <section className="page-section" aria-labelledby="okolica-title">
        <h2 id="okolica-title">W okolicy</h2>
        <p>
          Termy Uniejów to osobny, publiczny kompleks, około 3 km od hotelu. Hotel nie ma basenów
          termalnych. Rodziny mogą też odwiedzić Zagrodę Młynarską i przejechać edukacyjną ścieżką
          rowerową „Zieleń”. Zobacz <Link href="/atrakcje/">atrakcje w okolicy</Link>.
        </p>
        <p>
          Przerwa od miejskiego zgiełku to propozycja dla świadomych rodziców, którzy chcą dać
          dzieciom jakościowy czas.
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
