import { isPreview } from '@/lib/preview';

/** Visible mark of the preview build. Renders nothing in production. */
export function PreviewBanner() {
  if (!isPreview) return null;
  return (
    <p className="preview-banner" role="note">
      PODGLĄD – wersja robocza. To nie jest strona produkcyjna hotelu.
    </p>
  );
}
