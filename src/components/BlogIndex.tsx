import Link from 'next/link';
import type { BlogPost } from '@/lib/blog';
import { formatDatePl } from '@/lib/date';

/** Body of `/blog/`. A list of published posts or the "coming soon" line. */
export function BlogIndex({ posts }: { posts: readonly BlogPost[] }) {
  return (
    <div className="page blog">
      <h1>Blog</h1>
      {posts.length === 0 ? (
        <>
          <p>Wkrótce pierwsze wpisy.</p>
          <p>Tymczasem zobacz, co oferuje hotel:</p>
          <ul className="blog-links" aria-label="Oferta hotelu">
            <li>
              <Link className="blog-links__card" href="/pakiety/">
                <span className="blog-links__title">Pakiety i oferty</span>
                <span className="blog-links__desc">Aktualne pakiety i oferty hotelu.</span>
                <span className="blog-links__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
            <li>
              <Link className="blog-links__card" href="/pokoje/">
                <span className="blog-links__title">Pokoje</span>
                <span className="blog-links__desc">Zobacz pokoje i ich wyposażenie.</span>
                <span className="blog-links__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
            <li>
              <Link className="blog-links__card" href="/rezerwacja/">
                <span className="blog-links__title">Rezerwacja</span>
                <span className="blog-links__desc">Wyślij zapytanie albo zadzwoń do recepcji.</span>
                <span className="blog-links__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          </ul>
        </>
      ) : (
        <ul className="blog-list">
          {posts.map((post) => (
            <li key={post.slug} className="blog-list__item">
              <h2>
                <Link href={post.path}>{post.title}</Link>
              </h2>
              <p className="blog-meta">
                <time dateTime={post.date}>{formatDatePl(post.date)}</time> · {post.readingMinutes}{' '}
                min czytania
              </p>
              <p>{post.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
