import { FC, ReactElement } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import ReactMarkdown from "react-markdown";
import remarkFrontmatter from "remark-frontmatter";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { ReadableArea } from "@/components/adaptive-containers";
import { PostItem, formatTimestampToHumanReadableDate } from "./";

type MarkdownReaderProps = {
  children: string;
};

const MarkdownReader: FC<MarkdownReaderProps> = ({ children }) => {
  return (
    <ReactMarkdown
      className="markdown-reader pt-6 md:pt-12 pb-6"
      remarkPlugins={[remarkFrontmatter]}
      components={{
        pre({ children, ...props }) {
          const maybeCodeElement = children[0] as ReactElement;
          if (maybeCodeElement?.type == "code") {
            const className = maybeCodeElement.props.className;
            const match = /language-(\w+)/.exec(className || "");
            if (match) {
              const codeContents = maybeCodeElement.props.children;
              return (
                <SyntaxHighlighter language={match[1]} style={{ hljs: {} }}>
                  {String(codeContents).replace(/\n$/, "")}
                </SyntaxHighlighter>
              );
            }
          }

          return <pre {...props}>{children}</pre>;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

type BlogPostProps = {
  rawContents: string;
  metadata: PostItem;
};

const BlogPost: FC<BlogPostProps> = ({
  rawContents,
  metadata: { title, tag, date, description },
}) => {
  return (
    <ReadableArea hasVerticalMargins>
      <main>
        <article>
          <header>
            <p className="text-foreground-tertiary mb-2">
              #{tag} / <time>{formatTimestampToHumanReadableDate(date)}</time>
            </p>
            <h1 className="mb-4 text-3xl md:text-5xl md:leading-tight font-bold">
              {title}
            </h1>
            <h2 className="text-lg md:text-xl font-light text-foreground-secondary">
              {description}
            </h2>
          </header>
          <MarkdownReader>{rawContents}</MarkdownReader>
        </article>
      </main>
    </ReadableArea>
  );
};
export default BlogPost;

// For server-side rendering.
import fs from "node:fs/promises";
import path from "node:path";
import { getPostsDir, fetchPostMetadata } from "@/utils/server/post-fns";

export const getStaticProps: GetStaticProps<BlogPostProps> = async (
  context
) => {
  const slug = context.params?.slug;
  if (!slug) {
    throw new Error("Expected a slug");
  }

  const postsDir = getPostsDir();
  const fileName = `${slug}.md`;
  const file = await fs.readFile(path.resolve(postsDir, fileName));
  const metadata = await fetchPostMetadata(path.resolve(postsDir, fileName));
  if (!metadata) {
    throw new Error("Failed to parse the metadata");
  }

  return {
    props: {
      rawContents: file.toString("utf-8"),
      metadata,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const postsDir = getPostsDir();
  const dir = await fs.readdir(postsDir);
  return {
    paths: dir.map((file) => ({
      params: {
        slug: path.basename(file, path.extname(file)),
      },
    })),
    fallback: false,
  };
};
