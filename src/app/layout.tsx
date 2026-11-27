import type { Metadata, Viewport } from 'next';
import { ViewTransition, type ReactNode } from 'react';
import { JsonLd } from '@/components/JsonLd';
import { PreviewBanner } from '@/components/PreviewBanner';
import { SiteEffects } from '@/components/SiteEffects';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { TITLE_SUFFIX } from '@/lib/metadata';
import { nap } from '@/lib/nap';
import { isPreview } from '@/lib/preview';
import { buildHotelSchema } from '@/lib/schema/hotel';
import { fontFaceCss, fontUrl, preloadFonts } from '@/lib/fonts';
import { THEME_COLORS, themeInitScript } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(nap.siteUrl),
  title: { default: TITLE_SUFFIX, template: `%s | ${nap.name}` },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLORS.light },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLORS.dark },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The inline theme script changes data-theme and class before React hydrates.
    <html lang="pl" suppressHydrationWarning>
      <head>
        {/* Runs before the first paint: no flash of the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {preloadFonts.map((file) => (
          <link
            key={file}
            rel="preload"
            href={fontUrl(file)}
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        ))}
        <style dangerouslySetInnerHTML={{ __html: fontFaceCss() }} />
        {/* The preview build on GitHub Pages must not appear in search results. */}
        {isPreview ? <meta name="robots" content="noindex,nofollow" /> : null}
      </head>
      <body>
        <a className="skip-link" href="#main">
          Przejdź do treści
        </a>
        <div className="scroll-progress" aria-hidden="true" />
        <PreviewBanner />
        <SiteHeader />
        <ViewTransition>
          <main id="main" tabIndex={-1}>
            {children}
          </main>
        </ViewTransition>
        <SiteFooter />
        <SiteEffects />
        <JsonLd data={buildHotelSchema()} />
      </body>
    </html>
  );
}
