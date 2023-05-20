import { Metadata as NextMetadata } from "next";
import { notFound } from "next/navigation";
import {
  PostMetadata,
  processPostContents,
  getPostTranslations,
} from "@/server/post";
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
  lang?: string;
};

function urlForParams({ slug, lang }: Params): string {
  return `https://cyandev.app/blog/${slug}${lang ? `/${lang}` : ""}`;
}

export async function generateMetadata({
  params: { slug, lang },
}: {
  params: Params;
}): Promise<NextMetadata> {
  const slugWithLang = lang ? `${slug}.${lang}` : slug;

  try {
    const { metadata } = await getPost(slugWithLang);
    return buildMetadata({
      title: metadata.title,
      description: metadata.description,
      ogUrl: urlForParams({ slug, lang }),
      ogImage: `https://cyandev.app/api/og?title=${encodeURIComponent(
        metadata.title
      )}`,
    });
  } catch {
    return buildMetadata({});
  }
}

export default async function Page({
  params: { slug, lang },
}: {
  params: Params;
}) {
  const langSuffix = lang === "en" ? "" : `.${lang}`;
  const slugWithLang = `${slug}${langSuffix}`;

  try {
    const { metadata, contents } = await getPost(slugWithLang);
    const translations = await getPostTranslations(slug);

    return (
      <main>
        <BlogPost
          contents={contents}
          metadata={metadata}
          shareUrl={urlForParams({ slug, lang })}
          availableTranslations={translations}
          lang={lang}
        />
      </main>
    );
  } catch {
    notFound();
  }
}

export async function generateStaticParams({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const translations = ["en", ...(await getPostTranslations(slug))];
  return translations.map((t) => ({
    lang: t,
  }));
}
