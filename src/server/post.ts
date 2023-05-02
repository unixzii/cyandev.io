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

export async function fetchPostMetadata(
  filePath: string
): Promise<PostMetadata | undefined> {
  let metadataYaml: string | undefined;

  const file = await fs.readFile(filePath);
  await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(remarkFrontmatter, ["yaml"])
    .use(() => (tree: import("mdast").Root) => {
      const metadata = tree.children[0];
      if (metadata.type === "yaml") {
        metadataYaml = metadata.value;
      }
    })
    .process(file);

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
  return {
    ...metadata,
    slug: path.basename(filePath, path.extname(filePath)),
  };
}
