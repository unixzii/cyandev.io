import { fetchOrderedPosts } from "@/server/post";
import { buildMetadata } from "@/utils";
import { FooterSlot } from "@/components/footer";
import { BlogIndex } from "./BlogIndex";

export const metadata = buildMetadata({
  title: "Blog",
  description: "Blog posts from Cyandev with ❤️",
  ogUrl: "https://cyandev.app/blog",
  ogImage: "https://cyandev.app/twitter-cards/common.png",
});

export default async function Page() {
  const posts = (await fetchOrderedPosts()).map((p) => p.metadata);

  return (
    <main>
      <h1 className="text-3xl md:text-4xl font-medium">All posts</h1>
      <BlogIndex posts={posts} />
      <FooterSlot>
        <a
          className="px-2 underline decoration-transparent hover:decoration-foreground transition-colors duration-200"
          href="/blog/rss.xml"
        >
          RSS
        </a>
      </FooterSlot>
    </main>
  );
}
