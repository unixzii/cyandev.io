import { PostMetadata, fetchPosts } from "@/server/post";
import { buildMetadata } from "@/utils";
import { BlogIndex } from "./BlogIndex";

export const metadata = buildMetadata({
  title: "Blog",
  description: "Blog posts from Cyandev with ❤️",
  ogUrl: "https://cyandev.app/blog",
  ogImage: "https://cyandev.app/twitter-cards/common.png",
});

async function fetchOrderedPostMetadataList(): Promise<PostMetadata[]> {
  const posts = await fetchPosts(true);

  const postMetadataList = posts.map((post) => post.metadata);
  postMetadataList.sort((a, b) => b.date - a.date);

  return postMetadataList;
}

export default async function Page() {
  const posts = await fetchOrderedPostMetadataList();

  return (
    <main>
      <h1 className="text-3xl md:text-4xl font-medium">All posts</h1>
      <BlogIndex posts={posts} />
    </main>
  );
}
