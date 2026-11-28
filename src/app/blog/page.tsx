import { BlogIndex } from '@/components/BlogIndex';
import { getPublishedPosts } from '@/lib/blog';
import { routeMetadata } from '@/lib/metadata';

const path = '/blog/';

export const metadata = routeMetadata(path);

export default function Page() {
  return <BlogIndex posts={getPublishedPosts()} />;
}
