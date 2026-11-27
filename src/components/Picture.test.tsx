import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { images } from '@/lib/images';
import { Picture, type PictureProps } from './Picture';

const wide = images.find((image) => image.widths.length === 3);
if (!wide) throw new Error('The manifest needs one photo with three widths.');

type RenderProps = {
  slug?: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
};

function render(props: RenderProps = {}) {
  const all = {
    slug: wide!.slug,
    alt: 'Pokój z dużym łóżkiem',
    sizes: '100vw',
    ...props,
  } as PictureProps;
  return renderToStaticMarkup(<Picture {...all} />);
}

describe('Picture', () => {
  it('renders AVIF and WebP sources and a JPEG fallback', () => {
    const html = render();
    const [a, b, c] = wide!.widths;
    expect(html).toContain('<picture>');
    expect(html).toContain('type="image/avif"');
    expect(html).toContain('type="image/webp"');
    expect(html).toContain(`/img/${wide!.slug}-${a}.avif ${a}w`);
    expect(html).toContain(`/img/${wide!.slug}-${b}.webp ${b}w`);
    expect(html).toContain(`/img/${wide!.slug}-${c}.jpg ${c}w`);
    expect(html).toContain(`src="/img/${wide!.slug}-${c}.jpg"`);
    expect(html.indexOf('image/avif')).toBeLessThan(html.indexOf('image/webp'));
  });

  it('sets width, height, alt and sizes', () => {
    const html = render({ sizes: '(min-width: 768px) 50vw, 100vw' });
    expect(html).toContain(`width="${wide!.width}"`);
    expect(html).toContain(`height="${wide!.height}"`);
    expect(html).toContain('alt="Pokój z dużym łóżkiem"');
    expect(html).toContain('sizes="(min-width: 768px) 50vw, 100vw"');
  });

  it('loads lazy by default', () => {
    const html = render();
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).not.toContain('fetchPriority');
    expect(html.toLowerCase()).not.toContain('fetchpriority');
  });

  it('loads eager with high fetch priority when priority is set', () => {
    const html = render({ priority: true });
    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchPriority="high"');
    expect(html).not.toContain('loading="lazy"');
  });

  it('allows an empty alt only with the decorative prop', () => {
    expect(render({ alt: '', decorative: true })).toContain('alt=""');
    expect(() => render({ alt: '' })).toThrow(/alt/);
    expect(() => render({ alt: '   ' })).toThrow(/alt/);
  });

  it('throws for an unknown slug', () => {
    expect(() => render({ slug: 'does-not-exist' })).toThrow(/does-not-exist/);
  });
});
