import Link from 'next/link';
import { Picture } from '@/components/Picture';
import { nap } from '@/lib/nap';
import { routeMetadata } from '@/lib/metadata';

const path = '/';

export const metadata = routeMetadata(path);

export default function Page() {
  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__text">
          <h1 id="hero-title">Gościniec Uniejów – hotel w Uniejowie</h1>
          <p className="hero__lead">
            Gościniec Uniejów to hotel w dolinie Warty. Czekają na Ciebie komfortowe pokoje z
            łazienką, kameralna strefa SPA &amp; Wellness i restauracja z lokalnymi daniami.
            Odpocznij wśród dźwięków i zapachów nadwarciańskiej natury.
          </p>
          <p className="hero__former">Dawniej Gościniec Nad Wartą.</p>
          <div className="hero__actions">
            <Link className="button" href="/rezerwacja/">
              Rezerwuj
            </Link>
            <a className="phone-link" href={`tel:${nap.phoneE164}`}>
              Zadzwoń: {nap.phoneDisplay}
            </a>
          </div>
        </div>
        <div className="hero__image">
          <Picture
            slug="foto-7"
            alt="Budynek hotelu Gościniec Uniejów w otoczeniu zielonego ogrodu"
            sizes="(min-width: 72rem) 1152px, 100vw"
            priority
          />
        </div>
      </section>

      <section className="teaser" aria-labelledby="rooms-title">
        <div className="teaser__text">
          <h2 id="rooms-title">Pokoje w Uniejowie</h2>
          <p>
            Noclegi w Uniejowie w czterech typach pokoi: standard, superior, deluxe w standardzie 3*
            oraz rodzinny apartament. Pokoje mają łazienkę, telewizor z płaskim ekranem i zestaw do
            parzenia kawy i herbaty. Wybierz widok na ogród lub zielone pola.
          </p>
          <p>
            <Link href="/pokoje/">Zobacz pokoje</Link>
          </p>
        </div>
        <div className="teaser__image">
          <Picture
            slug="pokoj-3"
            alt="Jasny pokój hotelowy z łóżkiem i wyjściem na balkon"
            sizes="(min-width: 72rem) 560px, (min-width: 48rem) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="teaser teaser--reverse" aria-labelledby="spa-title">
        <div className="teaser__text">
          <h2 id="spa-title">SPA i wellness w hotelu</h2>
          <p>
            Hotel SPA w Uniejowie z kameralną strefą wellness: jacuzzi, sauna fińska i siłownia. W
            ofercie są także masaże oraz zabiegi relaksacyjno-pielęgnacyjne.
          </p>
          <p>
            Termy Uniejów to osobny kompleks basenowy w mieście. Hotel ma własną strefę wellness,
            ale nie ma basenów termalnych.
          </p>
          <p>
            <Link href="/spa/">Poznaj strefę SPA</Link>
          </p>
        </div>
        <div className="teaser__image">
          <Picture
            slug="foto-5-1"
            alt="Strefa wellness w hotelu z jacuzzi i leżakami"
            sizes="(min-width: 72rem) 560px, (min-width: 48rem) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="teaser" aria-labelledby="restaurant-title">
        <div className="teaser__text">
          <h2 id="restaurant-title">Restauracja</h2>
          <p>
            W restauracji hotelowej codziennie czekają lokalne przysmaki: świeże wypieki z
            miejscowej piekarni, wędliny i przetwory wyrabiane na miejscu oraz dania z dziczyzny.
            Spróbuj też domowej szarlotki i aromatycznej kawy.
          </p>
          <p>
            <Link href="/restauracja/">Zobacz restaurację</Link>
          </p>
        </div>
        <div className="teaser__image">
          <Picture
            slug="dsc0e0297"
            alt="Zapiekane mięso z puree podane w ceramicznej misce"
            sizes="(min-width: 72rem) 560px, (min-width: 48rem) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="teaser teaser--reverse" aria-labelledby="garden-title">
        <div className="teaser__text">
          <h2 id="garden-title">Ogród</h2>
          <p>
            Hotel otacza ogród, w którym pachnie lawendą, różą i magnolią. W sercu ogrodu jest oczko
            wodne. Na gości czekają boisko do siatkówki, wiata grillowa, ogrodowa balia z
            hydromasażem i bezpieczny plac zabaw z dala od drogi.
          </p>
        </div>
        <div className="teaser__image">
          <Picture
            slug="foto-1"
            alt="Rabaty z lawendą i kwiatami w ogrodzie hotelu"
            sizes="(min-width: 72rem) 560px, (min-width: 48rem) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="location" aria-labelledby="location-title">
        <h2 id="location-title">Lokalizacja</h2>
        <p>
          Nocleg w Uniejowie w spokojnym zakątku miasta, przy ul. Sienkiewicza 137. Stąd jest blisko
          do centrum i do kompleksu basenowego Termy Uniejów.
        </p>
        <ul className="location__list">
          <li>50 km od Łodzi</li>
          <li>150 km od Warszawy</li>
          <li>12 km od autostrady A2</li>
          <li>3 km od centrum miasta i Term Uniejów</li>
        </ul>
        <p className="location__links">
          <Link href="/atrakcje/">Atrakcje w Uniejowie i okolicy</Link>
          <Link href="/faq/">Najczęstsze pytania</Link>
        </p>
      </section>
    </div>
  );
}
