import { JsonLd } from '@/components/JsonLd';
import { withBase } from '@/lib/preview';
import { Picture } from '@/components/Picture';
import { routeMetadata } from '@/lib/metadata';
import { rooms } from '@/lib/rooms';
import { buildHotelRoomsSchema } from '@/lib/schema/hotel';

const path = '/pokoje/';

export const metadata = routeMetadata(path);

/** Two columns from 48 rem. The card is about 36 rem wide there. Full width below. */
const IMAGE_SIZES = '(min-width: 48rem) 36rem, 100vw';

export default function Page() {
  return (
    <div className="page page--wide">
      <h1>Pokoje w Uniejowie</h1>
      <p className="lead">
        Nocleg w Uniejowie w czterech typach pokoi: standard, superior, Deluxe w standardzie 3* i
        Rodzinny Apartament. Szukasz pokoju rodzinnego lub apartamentu w Uniejowie? Zapytaj o wolny
        termin.
      </p>
      <p>
        Hotel ma własną strefę Wellness z jacuzzi, sauną fińską i siłownią. Kompleks Termy Uniejów
        to osobny obiekt, około 3 km od hotelu.
      </p>

      <div className="rooms">
        {rooms.map((room, index) => {
          const headingId = `pokoj-${room.slug}`;
          return (
            <article key={room.slug} className="room" aria-labelledby={headingId}>
              <div className="room__image">
                <Picture
                  slug={room.imageSlugs[0]}
                  alt={room.imageAlt}
                  sizes={IMAGE_SIZES}
                  priority={index === 0}
                />
              </div>
              <div className="room__body">
                <h2 id={headingId}>{room.name}</h2>
                <p>{room.shortDescription}</p>
                <ul className="room__features">
                  {room.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <p className="room__price">
                  {room.priceFrom === null ? (
                    <>
                      Cena: zapytaj recepcję <span className="todo">TODO: cena od właściciela</span>
                    </>
                  ) : (
                    <>Cena od {room.priceFrom} zł za noc</>
                  )}
                </p>
                <p>
                  <a className="button" href={withBase(`/rezerwacja/?pokoj=${room.slug}`)}>
                    Zapytaj o termin
                    <span className="visually-hidden"> – {room.name}</span>
                  </a>
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <JsonLd data={buildHotelRoomsSchema(rooms)} />
    </div>
  );
}
