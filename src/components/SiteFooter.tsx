import Link from 'next/link';
import { legalNav, mainNav } from '@/lib/navigation';
import { nap } from '@/lib/nap';
import { CookieSettingsLink } from './CookieSettingsLink';
import { LogoRef } from './Logo';
import { NapBlock } from './NapBlock';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <p className="site-footer__logo">
            <LogoRef className="site-footer__logo-img" width={128} height={64} />
          </p>
          <NapBlock />
        </div>
        <nav aria-label="Na skróty">
          <ul className="footer-links footer-links--grid">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Informacje prawne">
          <ul className="footer-links">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <CookieSettingsLink />
            </li>
          </ul>
        </nav>
        <p className="site-footer__copy">
          © {new Date().getFullYear()} {nap.name}
        </p>
      </div>
    </footer>
  );
}
