import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/JsonLd';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { TITLE_SUFFIX } from '@/lib/metadata';
import { nap } from '@/lib/nap';
import { buildHotelSchema } from '@/lib/schema/hotel';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(nap.siteUrl),
  title: { default: TITLE_SUFFIX, template: `%s | ${nap.name}` },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body>
        <a className="skip-link" href="#main">
          Przejdź do treści
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <JsonLd data={buildHotelSchema()} />
      </body>
    </html>
  );
}
