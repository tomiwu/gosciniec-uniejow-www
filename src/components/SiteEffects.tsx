'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Progressive enhancement only. The page works and shows all content without this script.
 * - `data-scrolled` on <html> after 40 px of scroll (solid header over the hero).
 * - Reveal on scroll with IntersectionObserver when the browser has no scroll-driven animations.
 */
export function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const onScroll = () => root.toggleAttribute('data-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm || CSS.supports('animation-timeline: view()')) return;
    document.documentElement.classList.add('io');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
