import Link from 'next/link';
import { Picture } from '@/components/Picture';
import { attractions } from '@/lib/attractions';
import { routeMetadata } from '@/lib/metadata';

const path = '/atrakcje/';

export const metadata = routeMetadata(path);

/** The photo box is 268 px wide on a wide screen and the full column on a phone. */
const IMAGE_SIZES = '(min-width: 48rem) 268px, 100vw';

export default function Page() {
  return (
    <div className="page page--wide">
      <h1>Atrakcje w Uniejowie i okolicy</h1>
      <p className="lead">
        Szukasz informacji, co zwiedzać w Uniejowie? Zamek Uniejów, Termy Uniejów, tężnie, bulwary
        nad Wartą i szlaki rowerowe to atrakcje Uniejów, które możesz odkryć podczas pobytu w
        Gościńcu.
      </p>
      <p>
        Termy Uniejów to jedna z głównych atrakcji miasta. To publiczny kompleks, osobny od hotelu.
        Hotel ma własną strefę Wellness z jacuzzi, sauną fińską i siłownią. Wybierz{' '}
        <Link href="/pokoje/">pokój w hotelu</Link> albo sprawdź{' '}
        <Link href="/pakiety/">pakiety</Link>, a potem zaplanuj dni w Uniejowie.
      </p>

      <div className="attractions">
        {attractions.map((attraction) => {
          const headingId = `atrakcja-${attraction.slug}`;
          return (
            <section key={attraction.slug} className="attraction" aria-labelledby={headingId}>
              {attraction.image ? (
                <div className="attraction__image">
                  <Picture
                    slug={attraction.image.slug}
                    alt={attraction.image.alt}
                    sizes={IMAGE_SIZES}
                  />
                </div>
              ) : null}
              <div className="attraction__body">
                <h2 id={headingId}>{attraction.name}</h2>
                {attraction.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {attraction.distance ? (
                  <p className="attraction__distance">Odległość: {attraction.distance}.</p>
                ) : null}
                {attraction.todo ? (
                  <p>
                    <span className="todo">{attraction.todo}</span>
                  </p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      <section className="attraction attraction--text" aria-labelledby="natura-title">
        <h2 id="natura-title">Natura tuż przy hotelu</h2>
        <p>
          Gościniec leży w dolinie Warty, blisko Nadwarciańskiego Obszaru Chronionego Krajobrazu i
          obszaru Natura 2000 Dolina Środkowej Warty. Rano nad łąkami słychać żurawie i gęsi. Wiosną
          wracają bociany, a z tarasu restauracji możesz obserwować młode pisklęta.
        </p>
        <p>
          Dla miłośników spacerów i rowerów są szlaki: Ziemi Uniejowskiej, Św. Faustyny Kowalskiej,
          szlak rowerowy Gorące Źródła, Szlak Bursztynowy i konny szlak majora Hubala.
        </p>
      </section>

      <section className="attraction attraction--text" aria-labelledby="dzieci-title">
        <h2 id="dzieci-title">Uniejów z dziećmi</h2>
        <p>
          Uniejów z dziećmi to Termy dla gości w każdym wieku, skansen w Zagrodzie Młynarskiej i
          edukacyjna ścieżka rowerowa „Zieleń”. Hotel ma ogród z obszernym placem zabaw.
        </p>
        <p>
          Zobacz stronę <Link href="/dla-dzieci/">Dla dzieci</Link>. Rodziny mogą wybrać Rodzinny
          Apartament z <Link href="/pokoje/">oferty pokoi</Link>.
        </p>
      </section>

      <section className="attraction attraction--text" aria-labelledby="rezerwacja-title">
        <h2 id="rezerwacja-title">Zaplanuj pobyt w Uniejowie</h2>
        <p>
          Uniejów czeka, aby Cię oczarować. Zobacz <Link href="/pokoje/">pokoje</Link> i{' '}
          <Link href="/pakiety/">pakiety</Link> hotelu, a potem wyślij zapytanie o termin.
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
