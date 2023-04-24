import { FC } from "react";
import { GetStaticProps } from "next";
import Link from "next/link";
import { format as formatDate } from "date-fns";
import { ReadableArea } from "@/components/adaptive-containers";

export function formatTimestampToHumanReadableDate(timestamp: number): string {
  const date = new Date(timestamp);
  return formatDate(date, "MMM. do yyyy");
}

export type PostItem = {
  title: string;
  slug: string;
  tag: string;
  description: string;
  date: number;
};

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
            <li className="py-4" key={post.slug}>
              <Link className="block" href={`/blog/${post.slug}`}>
                <p className="mb-1 text-foreground-tertiary text-xs font-light">
                  #{post.tag}
                </p>
                <h2 className="mb-1 text-2xl font-bold">{post.title}</h2>
                <time className="block text-foreground-secondary text-sm">
                  {formatTimestampToHumanReadableDate(post.date)}
                </time>
              </Link>
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
import { getPostsDir, fetchPostMetadata } from "@/utils/server/post-fns";

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
