import fs from "node:fs/promises";
import path from "node:path";
import { Metadata as NextMetadata } from "next";
import { PostMetadata, fetchPostMetadata, getPostsDir } from "@/server/post";
import { buildMetadata } from "@/utils";
import { BlogPost } from "./BlogPost";

type Post = {
  rawContents: string;
  metadata: PostMetadata;
};

async function getPost(slug: string): Promise<Post> {
  const postsDir = getPostsDir();
  const fileName = `${slug}.md`;
  const file = await fs.readFile(path.resolve(postsDir, fileName));
  const metadata = await fetchPostMetadata(path.resolve(postsDir, fileName));
  if (!metadata) {
    throw new Error("Failed to parse the metadata");
  }

  return {
    rawContents: file.toString("utf-8"),
    metadata,
  };
}

type Params = {
  slug: string;
};

export async function generateMetadata({
  params: { slug },
}: {
  params: Params;
}): Promise<NextMetadata> {
  const { metadata } = await getPost(slug);
  return buildMetadata({
    title: metadata.title,
    description: metadata.description,
    ogUrl: `https://cyandev.app/blog/${metadata.slug}`,
    ogImage: `https://cyandev.app/api/og?title=${encodeURIComponent(
      metadata.title
    )}`,
  });
}

export default async function Page({ params: { slug } }: { params: Params }) {
  const { rawContents, metadata } = await getPost(slug);

  return (
    <main>
      <BlogPost
        rawContents={rawContents}
        metadata={metadata}
        shareUrl={`https://cyandev.app/blog/${slug}`}
      />
    </main>
  );
}
