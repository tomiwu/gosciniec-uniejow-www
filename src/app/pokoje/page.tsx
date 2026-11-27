import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { withBase } from '@/lib/preview';
import { Picture } from '@/components/Picture';
import { routeMetadata } from '@/lib/metadata';
import { rooms } from '@/lib/rooms';
import { buildHotelRoomsSchema } from '@/lib/schema/hotel';

const path = '/pokoje/';

export const metadata = routeMetadata(path);

/**
 * One column on a phone, two from 48 rem, four from 72 rem (as in the design demo).
 * On a phone the card is the screen width minus the two gutters (20 px each).
 */
const IMAGE_SIZES = '(min-width: 72rem) 290px, (min-width: 48rem) 46vw, calc(100vw - 40px)';

export default function Page() {
  return (
    <div className="rooms-page">
      <header className="page-hero wrap">
        <p className="eyebrow">Pokoje</p>
        <h1>Pokoje w Uniejowie</h1>
        <p className="lead">
          Nocleg w Uniejowie w czterech typach pokoi: standard, superior, Deluxe w standardzie 3* i
          Rodzinny Apartament. Szukasz pokoju rodzinnego lub apartamentu w Uniejowie? Zapytaj o
          wolny termin.
        </p>
      </header>

      <div className="wrap">
        <div className="rooms">
          {rooms.map((room, index) => {
            const headingId = `pokoj-${room.slug}`;
            return (
              <article
                key={room.slug}
                // The first card holds the LCP image: it must not wait for a reveal animation.
                className={index === 0 ? 'room card' : 'room card reveal'}
                aria-labelledby={headingId}
              >
                <div className="card__media room__image">
                  <Picture
                    slug={room.imageSlugs[0]}
                    alt={room.imageAlt}
                    sizes={IMAGE_SIZES}
                    priority={index === 0}
                  />
                </div>
                <div className="card__body room__body">
                  <h2 id={headingId}>{room.name}</h2>
                  <ul className="tags" aria-label="Najważniejsze">
                    {room.features.slice(0, 3).map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <p>{room.shortDescription}</p>
                  <details className="room__more">
                    <summary>Pełne wyposażenie</summary>
                    <ul className="room__features">
                      {room.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </details>
                  <p className="room__price">
                    {room.priceFrom === null ? (
                      <>
                        Cena: zapytaj recepcję{' '}
                        <span className="todo">TODO: cena od właściciela</span>
                      </>
                    ) : (
                      <>Cena od {room.priceFrom} zł za noc</>
                    )}
                  </p>
                  <a
                    className="button button--arrow room__cta"
                    href={withBase(`/rezerwacja/?pokoj=${room.slug}`)}
                  >
                    Zapytaj o termin
                    <span className="visually-hidden"> – {room.name}</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <section className="section alt rooms-wellness" aria-labelledby="rooms-wellness-title">
        <div className="wrap split split--reverse">
          <div className="pmedia">
            <Picture
              slug="foto-5-1"
              alt="Jacuzzi z podświetloną wodą w strefie wellness, w tle sauna"
              sizes="(min-width: 64rem) 560px, 100vw"
            />
            <span className="badge">Wellness</span>
          </div>
          <div className="reveal">
            <p className="eyebrow">W cenie pobytu</p>
            <h2 id="rooms-wellness-title">Strefa Wellness dla gości</h2>
            <p>
              Hotel ma własną strefę Wellness z jacuzzi, sauną fińską i siłownią. Goście pokoi
              superior, Deluxe i Rodzinnego Apartamentu mają do niej dostęp w cenie pobytu. Kompleks
              Termy Uniejów to osobny obiekt, około 3 km od hotelu.
            </p>
            <p>
              <Link className="text-link" href="/spa/">
                Strefa SPA <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </div>
      </section>

      <JsonLd data={buildHotelRoomsSchema(rooms)} />
    </div>
  );
}
