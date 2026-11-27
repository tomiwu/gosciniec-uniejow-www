import Link from 'next/link';
import { nap } from '@/lib/nap';
import { LogoMark } from './LogoMark';
import { MainNav } from './MainNav';
import { ThemeToggle } from './ThemeToggle';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link href="/" className="logo">
          <LogoMark />
          {/* Accessible name = visible text = "Gościniec Uniejów" (nap.name). */}
          <span className="logo__text">
            Gościniec <small>Uniejów</small>
          </span>
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
