import Link from 'next/link';
import { nap } from '@/lib/nap';
import { sylwester } from '@/lib/venue';

/**
 * Short card about the New Year's Eve ball. Facts only (issue #11, "Sylwester facts").
 * No amount here: the offer page shows the price. No invented menu or inclusions.
 */
export function SylwesterTeaser({ headingId }: { headingId: string }) {
  return (
    <section className="sylwester" aria-labelledby={headingId}>
      <h2 id={headingId}>{sylwester.title}</h2>
      <ul>
        <li>Termin: {sylwester.dateText}.</li>
        <li>
          Miejsce: {sylwester.place}, {nap.street}, {nap.city}.
        </li>
        <li>Muzyka: {sylwester.dj}.</li>
        <li>Chcesz zostać na noc? Zapraszamy. Stawkę za nocleg podaje recepcja.</li>
        <li>Łatwy dojazd z autostrady A2 i drogi S8.</li>
      </ul>
      <p>
        Rano 1 stycznia można zregenerować się w pobliskich Termach Uniejów. Termy to osobny
        kompleks. Wejście do term nie jest częścią ceny balu.
      </p>
      <p>
        <Link className="button" href={sylwester.path}>
          Zobacz ofertę Sylwestra 2026/2027
        </Link>
      </p>
    </section>
  );
}
