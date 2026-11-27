import Link from 'next/link';
import { nap } from '@/lib/nap';
import { MainNav } from './MainNav';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link href="/" className="logo">
          {nap.name}
        </Link>
        <div className="site-header__actions">
          <a className="phone-link" href={`tel:${nap.phoneE164}`}>
            {nap.phoneDisplay}
          </a>
          <Link className="button" href="/rezerwacja/">
            Rezerwuj
          </Link>
        </div>
      </div>
      <MainNav />
    </header>
  );
}
