import Link from 'next/link';
import { Picture } from '@/components/Picture';
import { PlaceholderBadge } from '@/components/PlaceholderBadge';
import { cheapestRoomFromPrice, placeholderPackages } from '@/content/placeholders';
import { offers } from '@/lib/offers';
import { sylwester } from '@/lib/venue';

const offerSizes = '(min-width: 64rem) 370px, (min-width: 48rem) 44vw, 82vw';

/** Home offers row after the hero (#40, #43). Sylwester first; no Offer JSON-LD on `/`. */
export function HomeOffersStrip() {
  const sylwesterOffer = offers.find((item) => item.id === 'sylwester-2026');
  const samplePackage = placeholderPackages[0];
  if (!sylwesterOffer || sylwesterOffer.price === null || !samplePackage) {
    throw new Error('Home offers strip needs the Sylwester offer and one placeholder package.');
  }
  return (
    <section className="section alt home-offers" aria-labelledby="home-offers-title">
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
                <Picture
                  slug="dsc0e8152"
                  alt="Odnowiona sala balowa hotelu z nakrytymi stołami – miejsce balu sylwestrowego"
                  sizes={offerSizes}
                />
              </div>
              <div className="card__body">
                <p className="eyebrow">Oferta sezonowa</p>
                <h3 id="home-offer-sylwester">{sylwesterOffer.name}</h3>
                <p>
                  {sylwester.dateText}. Odnowiona sala balowa. Muzyka: {sylwester.dj}. Nocleg i
                  menu: na zapytanie.
                </p>
                <p className="home-offer__price">
                  <strong>{sylwesterOffer.price} zł za parę</strong> (bal)
                </p>
                <Link className="card__link" href={sylwesterOffer.path}>
                  Zobacz szczegóły balu <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </li>
          <li>
            <article className="home-offer card" aria-labelledby={`home-offer-${samplePackage.id}`}>
              <div className="card__body">
                <p className="eyebrow">
                  <PlaceholderBadge />
                </p>
                <h3 id={`home-offer-${samplePackage.id}`}>{samplePackage.name}</h3>
                <p>{samplePackage.audience}</p>
                <p className="home-offer__price">{samplePackage.priceText}</p>
                <Link className="card__link" href={samplePackage.path}>
                  {samplePackage.linkLabel} <span aria-hidden="true">→</span>
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
