import fs from "node:fs/promises";
import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkFrontmatter from "remark-frontmatter";
import { parse as parseYaml } from "yaml";

// TODO: This is a little tricky, need to extract these types.
import { PostItem } from "../../pages/blog";

export function getPostsDir(): string {
  return path.resolve("./posts");
}

export async function fetchPostMetadata(
  filePath: string
): Promise<PostItem | undefined> {
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
