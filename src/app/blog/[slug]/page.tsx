import { Metadata as NextMetadata } from "next";
import { notFound } from "next/navigation";
import { PostMetadata, processPostContents, fetchPosts } from "@/server/post";
import { buildMetadata } from "@/utils";
import { BlogPost } from "./BlogPost";

type Post = {
  metadata: PostMetadata;
  contents: string;
};

async function getPost(slug: string): Promise<Post> {
  const processed = await processPostContents(slug);
  if (!processed) {
    throw new Error("Failed to parse the metadata");
  }

  const [metadata, contents] = processed;
  return { metadata, contents };
}

type Params = {
  slug: string;
};

export async function generateMetadata({
  params: { slug },
}: {
  params: Params;
}): Promise<NextMetadata> {
  try {
    const { metadata } = await getPost(slug);
    return buildMetadata({
      title: metadata.title,
      description: metadata.description,
      ogUrl: `https://cyandev.app/blog/${metadata.slug}`,
      ogImage: `https://cyandev.app/api/og?title=${encodeURIComponent(
        metadata.title
      )}`,
    });
  } catch {
    return buildMetadata({});
  }
}

export default async function Page({ params: { slug } }: { params: Params }) {
  try {
    const { metadata, contents } = await getPost(slug);
    return (
      <main>
        <BlogPost
          contents={contents}
          metadata={metadata}
          shareUrl={`https://cyandev.app/blog/${slug}`}
        />
      </main>
    );
  } catch {
    notFound();
  }
}

export async function generateStaticParams() {
  return (await fetchPosts(false)).map((post) => ({ slug: post.slug }));
}
