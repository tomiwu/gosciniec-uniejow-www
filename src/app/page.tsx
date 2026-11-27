import Link from 'next/link';
import { HomeOffersStrip } from '@/components/HomeOffersStrip';
import { Picture } from '@/components/Picture';
import { nap } from '@/lib/nap';
import { routeMetadata } from '@/lib/metadata';
import { withBase } from '@/lib/preview';
import { cardPictureSizes } from '@/lib/picture-sizes';
import { rooms } from '@/lib/rooms';
import { faq } from '@/lib/faq';
import { amenities, dayStory, gallery, homeFaqIds, venue } from '@/lib/home';

const path = '/';
const splitSizes = '(min-width: 64rem) 560px, 100vw';
const storySizes = '(min-width: 56rem) 560px, 100vw';
const spaCardSizes = '(min-width: 64rem) 370px, (min-width: 44rem) 50vw, 100vw';

export const metadata = routeMetadata(path);

function CarouselButtons({ label }: { label: string }) {
  return (
    <div className="car-ctrl" data-carousel-controls>
      <button className="car-btn" type="button" data-prev aria-label={`${label}: poprzednie`}>
        <span aria-hidden="true">←</span>
      </button>
      <button className="car-btn" type="button" data-next aria-label={`${label}: następne`}>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

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
            <li>Sala balowa</li>
            <li>Ogród i plac zabaw</li>
          </ul>
        </div>
        <span className="scroll-cue" aria-hidden="true" />
      </section>

      <HomeOffersStrip />

      {/* Amenities: the list is plain HTML. The moving copy is decoration only. */}
      <div className="marquee">
        <ul className="visually-hidden" aria-label="Udogodnienia">
          {amenities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="marquee__track" aria-hidden="true">
          {[0, 1].map((copy) => (
            <span key={copy} className="marquee__group">
              {amenities.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </span>
          ))}
        </div>
        <button className="marquee__pause" type="button" aria-pressed="false">
          <span className="visually-hidden">Zatrzymaj przewijanie udogodnień</span>
          <span aria-hidden="true">❚❚</span>
        </button>
      </div>

      <section className="section" aria-labelledby="rooms-title">
        <div className="wrap">
          <div className="section-head section-head--row reveal">
            <div>
              <p className="eyebrow">Pokoje</p>
              <h2 id="rooms-title">Pokoje w Uniejowie</h2>
              <p className="lead">
                Noclegi w Uniejowie w czterech typach pokoi: standard, superior, deluxe w
                standardzie 3* oraz rodzinny apartament. Pokoje mają łazienkę, telewizor z płaskim
                ekranem i zestaw do parzenia kawy i herbaty. Z okien widać ogród lub zielone pola.
              </p>
            </div>
            <CarouselButtons label="Pokoje" />
          </div>
          <div className="carousel" data-carousel>
            <ul className="track" aria-label="Typy pokoi">
              {rooms.map((room) => (
                <li key={room.slug} className="card room-card">
                  <div className="card__media">
                    <Picture
                      slug={room.imageSlugs[0]}
                      alt={room.imageAlt}
                      sizes={cardPictureSizes}
                    />
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
                      <span className="arr" aria-hidden="true">
                        →
                      </span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
            <div className="dots" aria-hidden="true" />
          </div>
          <p className="reveal">
            <Link className="text-link" href="/pokoje/">
              Wszystkie pokoje i wyposażenie <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </section>

      <section className="section alt" aria-labelledby="day-title">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Dzień w Gościńcu</p>
            <h2 id="day-title">Od porannej kawy do wieczoru w altanie</h2>
          </div>
          <div className="story" data-story>
            <div className="story__media">
              <span className="story__time" aria-hidden="true">
                {dayStory[0].time}
              </span>
              {dayStory.map((step, index) => (
                <div
                  key={step.time}
                  className={index === 0 ? 'story__photo is-on' : 'story__photo'}
                >
                  <Picture slug={step.image} alt={step.imageAlt} sizes={storySizes} />
                </div>
              ))}
            </div>
            <ol className="story__steps">
              {dayStory.map((step, index) => (
                <li
                  key={step.time}
                  className={index === 0 ? 'story__step is-on' : 'story__step'}
                  data-time={step.time}
                >
                  <p className="story__num">
                    {String(index + 1).padStart(2, '0')} · {step.time}
                  </p>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section night" aria-labelledby="spa-title">
        <div className="glow glow--1" aria-hidden="true" />
        <div className="glow glow--2" aria-hidden="true" />
        <div className="grid-lines" aria-hidden="true" />
        <div className="rings" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">SPA &amp; Wellness</p>
            <h2 id="spa-title" className="glow-text">
              SPA i wellness w hotelu
            </h2>
            <p className="lead">
              Hotel SPA w Uniejowie z kameralną strefą wellness: jacuzzi, sauna fińska i siłownia. W
              ofercie są także masaże oraz zabiegi relaksacyjno-pielęgnacyjne.
            </p>
          </div>
          <ul className="gcards stagger">
            <li className="gcard">
              <div className="gcard__media">
                <Picture
                  slug="foto-5-1"
                  alt="Jacuzzi z podświetloną wodą w strefie wellness, w tle sauna"
                  sizes={spaCardSizes}
                />
              </div>
              <div className="gcard__body">
                <h3>Jacuzzi</h3>
                <p>Delikatne kąpiele w jacuzzi w kameralnej strefie wellness.</p>
              </div>
            </li>
            <li className="gcard">
              <div className="gcard__media">
                <Picture
                  slug="foto-6-1"
                  alt="Leżak przed drewnianą sauną fińską w strefie wellness"
                  sizes={spaCardSizes}
                />
              </div>
              <div className="gcard__body">
                <h3>Sauna fińska</h3>
                <p>Ciepło sauny fińskiej uwalnia ciało od napięć.</p>
              </div>
            </li>
            <li className="gcard">
              <div className="gcard__media">
                <Picture
                  slug="foto-4-1"
                  alt="Kobieta odpoczywa w wannie z hydromasażem w strefie SPA"
                  sizes={spaCardSizes}
                />
              </div>
              <div className="gcard__body">
                <h3>Wanna z hydromasażem</h3>
                <p>Aromaterapia w wannie z hydromasażem.</p>
              </div>
            </li>
          </ul>
          <p className="night__note reveal">
            Termy Uniejów to osobny kompleks basenowy w mieście. Hotel ma własną strefę wellness,
            ale nie ma basenów termalnych.
          </p>
          <p className="reveal">
            <Link className="button" href="/spa/">
              Poznaj strefę SPA
            </Link>
          </p>
        </div>
      </section>

      <section className="section venue" aria-labelledby="venue-title">
        <div className="wrap">
          <div className="venue__intro">
            <div className="pmedia venue__media">
              <Picture
                slug="dsc0e8152"
                alt="Sala balowa z żyrandolami, nakrytymi stołami i krzesłami w złotym kolorze"
                sizes={splitSizes}
              />
              <span className="badge">Sala balowa</span>
            </div>
            <div className="reveal">
              <p className="eyebrow">Sala balowa i konferencje</p>
              <h2 id="venue-title">Wesela, przyjęcia i konferencje w Uniejowie</h2>
              <p className="lead">{venue.lead}</p>
              <p>{venue.text}</p>
            </div>
          </div>
          <ul className="venue-stats stagger" aria-label="Sale w liczbach">
            {venue.stats.map((stat) => (
              <li key={stat.label} className="venue-stat">
                <b data-count={stat.value}>{stat.value}</b>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
          <ul className="venue-cards stagger">
            <li className="card venue-card">
              <div className="card__media">
                <Picture
                  slug="img-0428"
                  alt="Długi stół weselny z białymi obrusami, świecznikami i krzesłami w pokrowcach"
                  sizes={splitSizes}
                />
              </div>
              <div className="card__body">
                <h3>Przyjęcia i wesela</h3>
                <p>{venue.parties}</p>
                <Link className="card__link" href="/przyjecia/">
                  Przyjęcia w Gościńcu <span aria-hidden="true">→</span>
                </Link>
              </div>
            </li>
            <li className="card venue-card">
              <div className="card__media">
                <Picture
                  slug="konferencje-uniejow-gosciniec"
                  alt="Sala konferencyjna w układzie teatralnym z ekranem i rzutnikiem"
                  sizes="(min-width: 64rem) 480px, 100vw"
                />
              </div>
              <div className="card__body">
                <h3>Konferencje i szkolenia</h3>
                <p>{venue.conferences}</p>
                <ul className="tags" aria-label="Wyposażenie sal">
                  {venue.equipment.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link className="card__link" href="/konferencje/">
                  Konferencje w Gościńcu <span aria-hidden="true">→</span>
                </Link>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="restaurant-title">
        <div className="wrap split">
          <div className="pmedia">
            <Picture
              slug="dsc0e0297"
              alt="Pieczone mięso z ziołami, puree i kapustą na drewnianej desce"
              sizes={splitSizes}
            />
            <span className="badge">Kuchnia</span>
          </div>
          <div className="reveal">
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
        </div>
      </section>

      <section className="section alt" aria-labelledby="garden-title">
        <div className="wrap split split--reverse">
          <div className="pmedia">
            <Picture
              slug="foto-1"
              alt="Rabaty z lawendą i kwiatami w ogrodzie hotelu"
              sizes={splitSizes}
            />
            <span className="badge">Ogród</span>
          </div>
          <div className="reveal">
            <p className="eyebrow">Na zewnątrz</p>
            <h2 id="garden-title">Ogród</h2>
            <p>
              Hotel otacza ogród, w którym pachnie lawendą, różą i magnolią. W sercu ogrodu jest
              oczko wodne. Na gości czekają boisko do siatkówki, wiata grillowa, ogrodowa balia z
              hydromasażem i bezpieczny plac zabaw z dala od drogi.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="gallery-title">
        <div className="wrap">
          <div className="section-head section-head--row reveal">
            <div>
              <p className="eyebrow">Galeria</p>
              <h2 id="gallery-title">Zajrzyj do środka</h2>
            </div>
            <CarouselButtons label="Galeria" />
          </div>
          <div className="carousel home-gallery" data-carousel>
            <ul className="track" aria-label="Zdjęcia hotelu">
              {gallery.map((photo) => (
                <li key={photo.slug}>
                  <figure className="gallery__item">
                    {/* Without JS the link opens the large photo. With JS it opens in a dialog. */}
                    <a
                      href={withBase(`/img/${photo.slug}-1600.jpg`)}
                      aria-label={`Powiększ zdjęcie: ${photo.alt}`}
                      data-lightbox
                    >
                      <Picture slug={photo.slug} alt={photo.alt} sizes={cardPictureSizes} />
                    </a>
                    <figcaption>{photo.caption}</figcaption>
                  </figure>
                </li>
              ))}
            </ul>
            <div className="dots" aria-hidden="true" />
          </div>
          {/* The script puts the large photo into this dialog. */}
          <dialog className="lightbox" aria-label="Powiększone zdjęcie">
            <form method="dialog">
              <button className="lightbox__close" type="submit" aria-label="Zamknij zdjęcie">
                <span aria-hidden="true">×</span>
              </button>
            </form>
          </dialog>
        </div>
      </section>

      <section className="section alt" aria-labelledby="location-title">
        <div className="wrap">
          <div className="section-head reveal">
            <p className="eyebrow">Dojazd</p>
            <h2 id="location-title">Lokalizacja</h2>
            <p className="lead">
              Nocleg w Uniejowie w spokojnym zakątku miasta, przy ul. Sienkiewicza 137. Stąd jest
              blisko do centrum i do kompleksu basenowego Termy Uniejów.
            </p>
          </div>
          <ul className="facts stagger">
            <li className="fact">50 km od Łodzi</li>
            <li className="fact">150 km od Warszawy</li>
            <li className="fact">12 km od autostrady A2</li>
            <li className="fact">3 km od centrum miasta i Term Uniejów</li>
          </ul>
          <p className="link-row reveal">
            <Link className="text-link" href="/atrakcje/">
              Atrakcje w Uniejowie i okolicy <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className="wrap faq-teaser">
          <div className="section-head reveal">
            <p className="eyebrow">FAQ</p>
            <h2 id="faq-title">Najczęstsze pytania</h2>
          </div>
          <div className="faq__list reveal">
            {homeFaqIds.map((id) => {
              const item = faq.find((entry) => entry.id === id);
              if (!item) return null;
              return (
                <details key={id} className="faq__item">
                  <summary>{item.question}</summary>
                  <div className="faq__answer">
                    <p>{item.answer}</p>
                  </div>
                </details>
              );
            })}
          </div>
          <p className="reveal">
            <Link className="text-link" href="/faq/">
              Wszystkie pytania i odpowiedzi <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
