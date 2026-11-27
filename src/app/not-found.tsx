import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nie znaleziono strony',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="page">
      <h1>Nie znaleziono strony</h1>
      <p>Strona, której szukasz, nie istnieje lub została przeniesiona.</p>
      <p>
        <Link href="/">Wróć na stronę główną</Link>
      </p>
    </div>
  );
}
