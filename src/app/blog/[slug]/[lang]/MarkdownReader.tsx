import { ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import { SyntaxHighlighter } from "@/components/markdown";

export type MarkdownReaderProps = {
  children: string;
};

export function MarkdownReader({ children }: MarkdownReaderProps) {
  return (
    <ReactMarkdown
      className="markdown-reader pt-6 md:pt-12 pb-6"
      components={{
        pre({ children, ...props }) {
          const maybeCodeElement = children[0] as ReactElement;
          if (maybeCodeElement?.type == "code") {
            const className = maybeCodeElement.props.className;
            const match = /language-(.+)/.exec(className || "");
            if (match) {
              const codeContents = maybeCodeElement.props.children;
              return (
                <SyntaxHighlighter languageAndOptions={match[1]}>
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
}
