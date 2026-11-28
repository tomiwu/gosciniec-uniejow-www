import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import type { BlogPost } from '@/lib/blog';
import { formatDatePl } from '@/lib/date';
import { nap } from '@/lib/nap';
import { buildBlogPostingSchema } from '@/lib/schema/blog';

/** Template of one blog article. The HTML comes from the build-time Markdown render. */
export function BlogArticle({ post }: { post: BlogPost }) {
  return (
    <article className="page blog-article">
      <JsonLd data={buildBlogPostingSchema(post)} />
      <p>
        <Link href="/blog/">← Wszystkie wpisy</Link>
      </p>
      <h1>{post.title}</h1>
      <p className="blog-meta">
        <time dateTime={post.date}>{formatDatePl(post.date)}</time> · {post.readingMinutes} min
        czytania
      </p>
      <div className="blog-article__body" dangerouslySetInnerHTML={{ __html: post.html }} />
      <aside className="blog-cta" aria-labelledby="blog-cta-title">
        <h2 id="blog-cta-title">Zarezerwuj pobyt</h2>
        <p>
          Zaplanuj pobyt w hotelu {nap.name}. Zadzwoń do recepcji:{' '}
          <a href={`tel:${nap.phoneE164}`}>{nap.phoneDisplay}</a>.
        </p>
        <p>
          <Link className="button" href="/rezerwacja/">
            Rezerwuj
          </Link>
        </p>
      </aside>
    </article>
  );
}
