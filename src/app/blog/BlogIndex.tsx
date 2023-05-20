import { Link } from "@/components/link";
import { formatTimestampToHumanReadableDate } from "@/utils/date-fns";
import { PostMetadata } from "@/server/post";

export type BlogIndexProps = {
  posts: PostMetadata[];
};

export function BlogIndex({ posts }: BlogIndexProps) {
  return (
    <ul className="py-6">
      {posts.map((post) => (
        <li className="block py-4" key={post.slug}>
          <p className="mb-1 text-foreground-tertiary text-xs font-light">
            #{post.tag}
          </p>
          <Link className="inline-block mb-1" href={`/blog/${post.slug}/en`}>
            <h2 className="inline-block text-2xl font-bold underline decoration-transparent hover:decoration-foreground transition-colors duration-200">
              {post.title}
            </h2>
          </Link>
          <time className="block text-foreground-secondary text-sm">
            {formatTimestampToHumanReadableDate(post.date)}
          </time>
        </li>
      ))}
    </ul>
  );
}
