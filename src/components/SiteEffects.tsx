'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Progressive enhancement only. The page works and shows all content without this script.
 * - `data-scrolled` on <html> after 40 px of scroll (solid header over the hero).
 * - Reveal on scroll with IntersectionObserver when the browser has no scroll-driven animations.
 * - Carousels (`[data-carousel]`): arrow buttons and dots.
 * - Time-of-day story (`[data-story]`): the sticky photo follows the step in the middle of the screen.
 * - Marquee pause button (WCAG 2.2.2).
 * - Count-up of numbers (`[data-count]`). The HTML has the final value.
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
    const cleanups: (() => void)[] = [];

    if (!calm && !CSS.supports('animation-timeline: view()')) {
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
      document
        .querySelectorAll('.reveal, .stagger')
        .forEach((element) => observer.observe(element));
      cleanups.push(() => observer.disconnect());
    }

    document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((carousel) => {
      cleanups.push(setUpCarousel(carousel, calm));
    });

    document.querySelectorAll<HTMLElement>('[data-story]').forEach((story) => {
      cleanups.push(setUpStory(story));
    });

    document.querySelectorAll<HTMLElement>('.marquee').forEach((marquee) => {
      const button = marquee.querySelector<HTMLButtonElement>('.marquee__pause');
      if (!button) return;
      const onClick = () => {
        const paused = marquee.toggleAttribute('data-paused');
        button.setAttribute('aria-pressed', String(paused));
      };
      button.addEventListener('click', onClick);
      cleanups.push(() => button.removeEventListener('click', onClick));
    });

    if (!calm) {
      const counter = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            counter.unobserve(entry.target);
            countUp(entry.target as HTMLElement);
          }
        },
        { threshold: 0.6 },
      );
      document.querySelectorAll('[data-count]').forEach((element) => counter.observe(element));
      cleanups.push(() => counter.disconnect());
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [pathname]);

  return null;
}

function setUpCarousel(carousel: HTMLElement, calm: boolean): () => void {
  const track = carousel.querySelector<HTMLElement>('.track');
  const section = carousel.closest('section') ?? carousel;
  const prev = section.querySelector<HTMLButtonElement>('[data-prev]');
  const next = section.querySelector<HTMLButtonElement>('[data-next]');
  const dots = carousel.querySelector<HTMLElement>('.dots');
  if (!track) return () => {};
  const items = [...track.children] as HTMLElement[];
  if (dots) dots.replaceChildren(...items.map(() => document.createElement('i')));
  const step = () => (items[0]?.getBoundingClientRect().width ?? 300) + 16;
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    if (prev) prev.disabled = track.scrollLeft < 8;
    if (next) next.disabled = track.scrollLeft > max - 8;
    const index = Math.min(Math.round(track.scrollLeft / step()), items.length - 1);
    dots?.querySelectorAll('i').forEach((dot, i) => dot.classList.toggle('on', i === index));
  };
  const go = (direction: number) =>
    track.scrollBy({ left: direction * step(), behavior: calm ? 'auto' : 'smooth' });
  const onPrev = () => go(-1);
  const onNext = () => go(1);
  let frame = 0;
  const onScroll = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };
  prev?.addEventListener('click', onPrev);
  next?.addEventListener('click', onNext);
  track.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
  return () => {
    prev?.removeEventListener('click', onPrev);
    next?.removeEventListener('click', onNext);
    track.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}

function setUpStory(story: HTMLElement): () => void {
  const steps = [...story.querySelectorAll<HTMLElement>('.story__step')];
  const photos = [...story.querySelectorAll<HTMLElement>('.story__photo')];
  const time = story.querySelector<HTMLElement>('.story__time');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const index = steps.indexOf(entry.target as HTMLElement);
        steps.forEach((s, i) => s.classList.toggle('is-on', i === index));
        photos.forEach((p, i) => p.classList.toggle('is-on', i === index));
        if (time) time.textContent = (entry.target as HTMLElement).dataset['time'] ?? '';
      }
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  steps.forEach((s) => observer.observe(s));
  return () => observer.disconnect();
}

function countUp(element: HTMLElement): void {
  const end = Number(element.dataset['count']);
  if (!Number.isFinite(end)) return;
  const start = performance.now();
  const duration = 1200;
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    element.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
