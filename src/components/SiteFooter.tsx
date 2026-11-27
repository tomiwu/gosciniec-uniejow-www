import Link from 'next/link';
import { legalNav } from '@/lib/navigation';
import { nap } from '@/lib/nap';
import { NapBlock } from './NapBlock';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <NapBlock />
        <nav aria-label="Informacje prawne">
          <ul className="footer-links">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="site-footer__copy">
          © {new Date().getFullYear()} {nap.name}
        </p>
      </div>
    </footer>
  );
}
