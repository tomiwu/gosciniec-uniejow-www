import Link from 'next/link';
import { nap } from '@/lib/nap';
import { Logo } from './Logo';
import { MainNav } from './MainNav';
import { ThemeToggle } from './ThemeToggle';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link href="/" className="logo">
          {/* Accessible name = "Gościniec Uniejów" (nap.name), from the logo. */}
          <Logo className="logo__img" width={112} height={56} />
        </Link>
        <div className="site-header__actions">
          <a className="phone-link site-header__wide" href={`tel:${nap.phoneE164}`}>
            {nap.phoneDisplay}
          </a>
          <ThemeToggle />
          <Link className="button site-header__wide" href="/rezerwacja/">
            Rezerwuj
          </Link>
        </div>
        <MainNav />
      </div>
      {/* Mobile only: the main actions stay in the thumb zone. */}
      <div className="action-bar">
        <a className="button button--ghost" href={`tel:${nap.phoneE164}`}>
          Zadzwoń
        </a>
        <Link className="button button--arrow" href="/rezerwacja/">
          Rezerwuj
        </Link>
      </div>
    </header>
  );
}
