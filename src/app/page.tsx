import Link from 'next/link';
import { Picture } from '@/components/Picture';
import { nap } from '@/lib/nap';
import { routeMetadata } from '@/lib/metadata';
import { withBase } from '@/lib/preview';
import { rooms } from '@/lib/rooms';

const path = '/';
const featureSizes = '(min-width: 64rem) 560px, 100vw';
const roomCardSizes = '(min-width: 64rem) 280px, 80vw';

export const metadata = routeMetadata(path);

export default function Page() {
  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-title">
        {/* LCP element: no load animation, no opacity change. */}
        <div className="hero__media">
          <Picture
            slug="foto-7"
            alt="Budynek hotelu Gościniec Uniejów w otoczeniu zielonego ogrodu"
            sizes="100vw"
            priority
          />
        </div>
        <div className="hero__text wrap">
          <p className="eyebrow">Uniejów · hotel · restauracja · SPA</p>
          <h1 id="hero-title">Gościniec Uniejów – hotel w Uniejowie</h1>
          <p className="hero__lead">
            Gościniec Uniejów to hotel w dolinie Warty. Czekają na Ciebie komfortowe pokoje z
            łazienką, kameralna strefa SPA &amp; Wellness i restauracja z lokalnymi daniami.
            Odpocznij wśród dźwięków i zapachów nadwarciańskiej natury.
          </p>
          <p className="hero__former">Dawniej Gościniec Nad Wartą.</p>
          <div className="hero__actions">
            <Link className="button button--large button--arrow" href="/rezerwacja/">
              Rezerwuj
            </Link>
            <a className="button button--light button--large" href={`tel:${nap.phoneE164}`}>
              Zadzwoń: {nap.phoneDisplay}
            </a>
          </div>
          <ul className="chips" aria-label="W hotelu">
            <li>Jacuzzi i sauna</li>
            <li>Restauracja</li>
            <li>Ogród</li>
            <li>Plac zabaw</li>
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="rooms-title">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Pokoje</p>
            <h2 id="rooms-title">Pokoje w Uniejowie</h2>
            <p className="lead">
              Noclegi w Uniejowie w czterech typach pokoi: standard, superior, deluxe w standardzie
              3* oraz rodzinny apartament. Pokoje mają łazienkę, telewizor z płaskim ekranem i
              zestaw do parzenia kawy i herbaty. Z okien widać ogród lub zielone pola.
            </p>
          </div>
          <ul className="room-rail" aria-label="Typy pokoi">
            {rooms.map((room) => (
              <li key={room.slug} className="card room-card reveal">
                <div className="card__media">
                  <Picture slug={room.imageSlugs[0]} alt={room.imageAlt} sizes={roomCardSizes} />
                </div>
                <div className="card__body">
                  <h3>{room.name}</h3>
                  <ul className="tags">
                    {room.features.slice(0, 3).map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <a className="card__link" href={withBase(`/rezerwacja/?pokoj=${room.slug}`)}>
                    Zapytaj o termin<span className="visually-hidden"> – {room.name}</span>{' '}
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <p className="reveal">
            <Link className="button button--ghost" href="/pokoje/">
              Zobacz pokoje
            </Link>
          </p>
        </div>
      </section>

      <section className="section night" aria-labelledby="spa-title">
        <div className="night__glow" aria-hidden="true" />
        <div className="wrap feature">
          <div className="feature__text reveal">
            <p className="eyebrow">SPA &amp; Wellness</p>
            <h2 id="spa-title" className="glow-text">
              SPA i wellness w hotelu
            </h2>
            <p>
              Hotel SPA w Uniejowie z kameralną strefą wellness: jacuzzi, sauna fińska i siłownia. W
              ofercie są także masaże oraz zabiegi relaksacyjno-pielęgnacyjne.
            </p>
            <p>
              Termy Uniejów to osobny kompleks basenowy w mieście. Hotel ma własną strefę wellness,
              ale nie ma basenów termalnych.
            </p>
            <p>
              <Link className="button" href="/spa/">
                Poznaj strefę SPA
              </Link>
            </p>
          </div>
          <div className="feature__media reveal">
            <Picture
              slug="foto-5-1"
              alt="Strefa wellness w hotelu z jacuzzi, sauną i leżakami"
              sizes={featureSizes}
            />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="restaurant-title">
        <div className="wrap feature">
          <div className="feature__text reveal">
            <p className="eyebrow">Kuchnia</p>
            <h2 id="restaurant-title">Restauracja</h2>
            <p>
              W restauracji hotelowej codziennie czekają lokalne przysmaki: świeże wypieki z
              miejscowej piekarni, wędliny i przetwory wyrabiane na miejscu oraz dania z dziczyzny.
              Spróbuj też domowej szarlotki i aromatycznej kawy.
            </p>
            <p>
              <Link className="text-link" href="/restauracja/">
                Zobacz restaurację <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
          <div className="feature__media reveal">
            <Picture
              slug="dsc0e0297"
              alt="Pieczone mięso z ziołami, puree i kapustą na drewnianej desce"
              sizes={featureSizes}
            />
          </div>
        </div>
      </section>

      <section className="section alt" aria-labelledby="garden-title">
        <div className="wrap feature feature--reverse">
          <div className="feature__text reveal">
            <p className="eyebrow">Na zewnątrz</p>
            <h2 id="garden-title">Ogród</h2>
            <p>
              Hotel otacza ogród, w którym pachnie lawendą, różą i magnolią. W sercu ogrodu jest
              oczko wodne. Na gości czekają boisko do siatkówki, wiata grillowa, ogrodowa balia z
              hydromasażem i bezpieczny plac zabaw z dala od drogi.
            </p>
          </div>
          <div className="feature__media reveal">
            <Picture
              slug="foto-1"
              alt="Rabaty z lawendą i kwiatami w ogrodzie hotelu"
              sizes={featureSizes}
            />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="location-title">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Dojazd</p>
            <h2 id="location-title">Lokalizacja</h2>
            <p className="lead">
              Nocleg w Uniejowie w spokojnym zakątku miasta, przy ul. Sienkiewicza 137. Stąd jest
              blisko do centrum i do kompleksu basenowego Termy Uniejów.
            </p>
          </div>
          <ul className="facts">
            <li className="fact reveal">50 km od Łodzi</li>
            <li className="fact reveal">150 km od Warszawy</li>
            <li className="fact reveal">12 km od autostrady A2</li>
            <li className="fact reveal">3 km od centrum miasta i Term Uniejów</li>
          </ul>
          <p className="link-row reveal">
            <Link className="text-link" href="/atrakcje/">
              Atrakcje w Uniejowie i okolicy <span aria-hidden="true">→</span>
            </Link>
            <Link className="text-link" href="/faq/">
              Najczęstsze pytania <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
