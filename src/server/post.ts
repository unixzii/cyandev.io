import fs from "node:fs/promises";
import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkFrontmatter from "remark-frontmatter";
import { parse as parseYaml } from "yaml";

export type PostMetadata = {
  title: string;
  slug: string;
  tag: string;
  description: string;
  date: number;
};

export function getPostsDir(): string {
  return path.resolve("./data/posts");
}

export async function processPostContents(
  slug: string
): Promise<[PostMetadata, string] | undefined> {
  const filePath = path.join(getPostsDir(), `${slug}.md`);
  const rawContents = (await fs.readFile(filePath)).toString("utf-8");

  let metadataYaml: string | undefined;

  const processedContents = await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkFrontmatter, ["yaml"])
    .use(() => (tree: import("mdast").Root) => {
      const metadata = tree.children[0];
      if (metadata.type === "yaml") {
        metadataYaml = metadata.value;
        tree.children.splice(0, 1);
      }
    })
    .process(rawContents);

  if (!metadataYaml) {
    return;
  }
  const metadata = parseYaml(metadataYaml);
  if (!metadata.title) {
    return;
  }
  if (metadata.date) {
    metadata.date = +new Date(metadata.date);
  }

  const langSuffix = path.extname(slug);
  metadata.slug = langSuffix ? path.basename(slug, langSuffix) : slug;

  return [metadata, processedContents.toString()];
}

export async function getPostTranslations(slug: string): Promise<string[]> {
  const postsDir = getPostsDir();
  const dir = await fs.readdir(postsDir);

  const translations: string[] = [];

  for (const file of dir) {
    const slug_ = path.basename(file, path.extname(file));
    const langSuffix = path.extname(slug_);
    if (!langSuffix) {
      continue;
    }

    if (path.basename(slug_, langSuffix) === slug) {
      translations.push(langSuffix.slice(1));
    }
  }

  return translations;
}

export type Post = {
  slug: string;
  metadata: PostMetadata;
  contents: string;
};

export type FetchPostsResult<B extends boolean> = B extends true
  ? Post
  : Pick<Post, "slug">;

export async function fetchPosts<B extends boolean>(
  processContents: B
): Promise<FetchPostsResult<B>[]> {
  const postsDir = getPostsDir();
  const dir = await fs.readdir(postsDir);

  const posts: Record<string, any>[] = [];

  for (const file of dir) {
    const slug = path.basename(file, path.extname(file));
    const langSuffix = path.extname(slug);

    if (langSuffix) {
      // Do not include translation versions in the post list.
      continue;
    }

    if (processContents) {
      const processed = await processPostContents(slug);
      if (!processed) {
        const filePath = path.join(postsDir, file);
        throw new Error(`Failed to process the file: ${filePath}`);
      }
      const [metadata, contents] = processed;
      posts.push({
        slug,
        metadata,
        contents,
      } satisfies FetchPostsResult<true>);
    } else {
      posts.push({
        slug,
      } satisfies FetchPostsResult<false>);
    }
  }

  return posts as FetchPostsResult<B>[];
}
