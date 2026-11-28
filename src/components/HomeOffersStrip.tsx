import Link from 'next/link';
import { Picture } from '@/components/Picture';
import { PlaceholderBadge } from '@/components/PlaceholderBadge';
import { cheapestRoomFromPrice, placeholderPackages } from '@/content/placeholders';
import { nap } from '@/lib/nap';
import { cardPictureSizes } from '@/lib/picture-sizes';
import { offers } from '@/lib/offers';
import { sylwester, sylwesterPlaceSentence } from '@/lib/venue';

/** Home offers row after the hero (#40, #43). Sylwester first; no Offer JSON-LD on `/`. */
export function HomeOffersStrip() {
  const sylwesterOffer = offers.find((item) => item.id === 'sylwester-2026');
  const [sample] = placeholderPackages;
  if (!sylwesterOffer || sylwesterOffer.price === null || !sample) {
    throw new Error('Home offers strip needs the Sylwester offer and one placeholder package.');
  }
  return (
    <section
      className="section alt home-offers home-offers--reserved"
      aria-labelledby="home-offers-title"
    >
      <div className="wrap">
        <div className="section-head reveal">
          <p className="eyebrow">Oferty</p>
          <h2 id="home-offers-title">Aktualne oferty</h2>
          <p className="lead">
            Sezonowe wydarzenia i pakiety pobytowe w Gościńcu Uniejów. Ceny dotyczą ofert z
            potwierdzoną kwotą.
          </p>
        </div>
        <ul className="home-offers__list stagger">
          <li>
            <article className="home-offer card" aria-labelledby="home-offer-sylwester">
              <div className="card__media">
                <Picture slug="dj-letsky" alt={sylwester.djPhotoAlt} sizes={cardPictureSizes} />
              </div>
              <div className="card__body">
                <p className="eyebrow">Oferta sezonowa</p>
                <h3 id="home-offer-sylwester">{sylwesterOffer.name}</h3>
                <p>
                  <time dateTime={sylwester.dateIso}>{sylwester.dateText}</time>.{' '}
                  {sylwesterPlaceSentence}, {nap.street}, {nap.city}. Muzyka: {sylwester.dj}. Chcesz
                  zostać na noc? Zapraszamy! Łatwy dojazd z autostrady A2 i drogi S8. Nocleg i menu:
                  na zapytanie.
                </p>
                <p className="home-offer__price">
                  <strong>{sylwesterOffer.price} zł za parę</strong> (bal)
                </p>
                <Link className="card__link" href={sylwester.path}>
                  Zobacz szczegóły balu <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </li>
          <li>
            <article className="home-offer card" aria-labelledby={`home-offer-${sample.id}`}>
              <div className="card__body">
                <p className="eyebrow">
                  <PlaceholderBadge />
                </p>
                <h3 id={`home-offer-${sample.id}`}>{sample.name}</h3>
                <p>{sample.audience}</p>
                <p className="home-offer__price">{sample.priceText}</p>
                <Link className="card__link" href={sample.path}>
                  {sample.linkLabel} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </li>
        </ul>
        <p className="from-price home-offers__from reveal">
          Nocleg już od <strong>{cheapestRoomFromPrice.amount} zł za noc</strong>{' '}
          <PlaceholderBadge />
          {' · '}
          <Link className="text-link" href="/ceny/">
            Pełny cennik noclegów <span aria-hidden="true">→</span>
          </Link>
        </p>
        <p className="reveal">
          <Link className="text-link" href="/pakiety/">
            Wszystkie pakiety i oferty <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
