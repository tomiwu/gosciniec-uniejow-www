import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { JsonLd } from '@/components/JsonLd';
import { nap } from '@/lib/nap';
import { buildHotelSchema } from '@/lib/schema/hotel';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(nap.siteUrl),
  title: { default: nap.name, template: `%s | ${nap.name}` },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body>
        {children}
        <JsonLd data={buildHotelSchema()} />
      </body>
    </html>
  );
}
