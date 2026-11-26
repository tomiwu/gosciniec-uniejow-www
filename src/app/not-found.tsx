import type { Metadata } from 'next';
import Link from 'next/link';
import { NapBlock } from '@/components/NapBlock';

export const metadata: Metadata = {
  title: 'Nie znaleziono strony',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="page">
      <h1>Nie znaleziono strony</h1>
      <p>Strona, której szukasz, nie istnieje lub została przeniesiona.</p>
      <p>
        <Link href="/">Wróć na stronę główną</Link>
      </p>
      <NapBlock />
    </main>
  );
}
