import { Picture } from '@/components/Picture';
import type { ImageSlug } from '@/lib/images';

export interface GalleryPhoto {
  slug: ImageSlug;
  /** Polish alt text. It describes only what the photo shows. */
  alt: string;
}

/** The photo box is one third of the page on a wide screen, half on a tablet, full on a phone. */
const GALLERY_SIZES = '(min-width: 64rem) 384px, (min-width: 40rem) 50vw, 100vw';

/** A grid of photos. Every photo is lazy. Use it below the first screen. */
export function PhotoGallery({
  photos,
  label,
}: {
  photos: readonly GalleryPhoto[];
  label: string;
}) {
  return (
    <ul className="gallery" aria-label={label}>
      {photos.map((photo) => (
        <li key={photo.slug}>
          <Picture slug={photo.slug} alt={photo.alt} sizes={GALLERY_SIZES} />
        </li>
      ))}
    </ul>
  );
}
