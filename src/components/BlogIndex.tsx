import Link from 'next/link';
import type { BlogPost } from '@/lib/blog';
import { formatDatePl } from '@/lib/date';

/** Body of `/blog/`. A list of published posts or the "coming soon" line. */
export function BlogIndex({ posts }: { posts: readonly BlogPost[] }) {
  return (
    <div className="page blog">
      <h1>Blog</h1>
      {posts.length === 0 ? (
        <p>Wkrótce pierwsze wpisy.</p>
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
