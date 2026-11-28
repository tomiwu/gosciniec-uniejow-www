import { preload } from 'react-dom';
import { images, type ImageSlug } from '@/lib/images';
import { withBase } from '@/lib/preview';

interface BaseProps {
  slug: ImageSlug;
  /** Value of the `sizes` attribute. It must match the CSS width of the image. */
  sizes: string;
  /** Use for the LCP image only. Sets `loading="eager"` and `fetchpriority="high"`. */
  priority?: boolean;
  className?: string;
}

type InformativeProps = BaseProps & { alt: string; decorative?: false };
type DecorativeProps = BaseProps & { alt: ''; decorative: true };

export type PictureProps = InformativeProps | DecorativeProps;

function srcSet(slug: string, widths: readonly number[], format: string): string {
  return widths.map((w) => `${withBase(`/img/${slug}-${w}.${format}`)} ${w}w`).join(', ');
}

export function Picture({
  slug,
  alt,
  sizes,
  priority = false,
  decorative,
  className,
}: PictureProps) {
  const image = images.find((entry) => entry.slug === slug);
  if (!image) throw new Error(`Picture: unknown image slug "${slug}".`);
  if (alt.trim() === '' && !decorative) {
    throw new Error(
      `Picture: "${slug}" needs an alt text. Use the decorative prop for an empty alt.`,
    );
  }
  const largest = image.widths[image.widths.length - 1];

  if (priority) {
    // The browser finds the LCP photo in the head, before it parses the body. The type attribute
    // makes browsers without AVIF skip this hint. They then use the img element as before.
    preload(withBase(`/img/${slug}-${largest}.avif`), {
      as: 'image',
      type: 'image/avif',
      imageSrcSet: srcSet(slug, image.widths, 'avif'),
      imageSizes: sizes,
      fetchPriority: 'high',
    });
  }

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(slug, image.widths, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(slug, image.widths, 'webp')} sizes={sizes} />
      {/* The rule @next/next/no-img-element allows an img inside a picture element. */}
      <img
        src={withBase(`/img/${slug}-${largest}.jpg`)}
        srcSet={srcSet(slug, image.widths, 'jpg')}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={decorative ? '' : alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
