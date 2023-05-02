import fs from "node:fs/promises";
import path from "node:path";
import { PostMetadata, getPostsDir, fetchPostMetadata } from "@/server/post";
import { buildMetadata } from "@/utils";
import { BlogIndex } from "./BlogIndex";

export const metadata = buildMetadata({
  title: "Blog",
  description: "Blog posts from Cyandev with ❤️",
  ogUrl: "https://cyandev.app/blog",
  ogImage: "https://cyandev.app/twitter-cards/common.png",
});

async function getPosts(): Promise<PostMetadata[]> {
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

  return posts;
}

export default async function Page() {
  const posts = await getPosts();

  return (
    <main>
      <h1 className="text-3xl md:text-4xl font-medium">All posts</h1>
      <BlogIndex posts={posts} />
    </main>
  );
}
