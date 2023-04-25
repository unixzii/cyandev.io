import { FC } from "react";
import { GetStaticProps } from "next";
import Link from "next/link";
import { format as formatDate } from "date-fns";
import { ReadableArea } from "@/components/adaptive-containers";
import { PostItem } from "@/server/post";

export function formatTimestampToHumanReadableDate(timestamp: number): string {
  const date = new Date(timestamp);
  return formatDate(date, "MMM. do yyyy");
}

type BlogIndexProps = {
  posts: PostItem[];
};

const BlogIndex: FC<BlogIndexProps> = ({ posts }) => {
  return (
    <ReadableArea hasVerticalMargins>
      <main>
        <h1 className="text-3xl md:text-4xl font-medium">All posts</h1>
        <ul className="py-6">
          {posts.map((post) => (
            <li className="block py-4" key={post.slug}>
              <p className="mb-1 text-foreground-tertiary text-xs font-light">
                #{post.tag}
              </p>
              <Link className="inline-block mb-1" href={`/blog/${post.slug}`}>
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
      </main>
    </ReadableArea>
  );
};
export default BlogIndex;

BlogIndex.staticMetadata = {
  ogUrl: "https://cyandev.app/blog",
  ogImage: "https://cyandev.app/twitter-cards/common.png",
  ogDescription: "Blog posts from Cyandev with ❤️",
};

// For server-side rendering.
import fs from "node:fs/promises";
import path from "node:path";
import { getPostsDir, fetchPostMetadata } from "@/server/post";

export const getStaticProps: GetStaticProps<BlogIndexProps> = async () => {
  const postsDir = getPostsDir();
  const dir = await fs.readdir(postsDir);

  const posts = [];
  for (const file of dir) {
    const post = await fetchPostMetadata(path.join(postsDir, file));
    if (post) {
      posts.push(post);
    }
  }

  posts.sort((a, b) => b.date - a.date);

  return {
    props: { posts },
  };
};
