import { FC, useMemo } from "react";
import PrismSyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism";
import createElement from "react-syntax-highlighter/dist/esm/create-element";
import { selectClass } from "@/utils";

type Renderer = NonNullable<PrismSyntaxHighlighter["props"]["renderer"]>;
function createRenderer(highlightLines: Set<number>): Renderer {
  return ({ rows }) => {
    return rows.map((node, i) => {
      const children =
        node.children?.map((child, i) =>
          createElement({
            node: child,
            stylesheet: {},
            useInlineStyles: false,
            key: `code-segment-${i}`,
          })
        ) || [];
      return (
        <div
          className={selectClass({
            "relative px-4 py-0.5": true,
            "bg-foreground/10": highlightLines.has(i),
          })}
          key={`code-line-${i}`}
        >
          {children}
        </div>
      );
    });
  };
}

type LanguageAndOptions = {
  language: string;
  highlightLines: Set<number>;
};
function parseLanguageAndOptions(
  languageAndOptions: string
): LanguageAndOptions | null {
  // Parse inputs like `jsx{1,3}` or `jsx` (without highlight lines).
  const matches = /([^{]+)({(.+)})?/.exec(languageAndOptions);
  if (!matches) {
    return null;
  }

  const language = matches[1];
  const rawHighlightLines = matches[3];

  return {
    language,
    highlightLines: new Set(
      rawHighlightLines?.split(",").map((s) => parseInt(s)) || []
    ),
  };
}

type SyntaxHighlighterProps = {
  languageAndOptions: string;
  children: string;
};

export const SyntaxHighlighter: FC<SyntaxHighlighterProps> = ({
  languageAndOptions,
  children,
}) => {
  const parsedLanguageAndOptions = useMemo(() => {
    return parseLanguageAndOptions(languageAndOptions);
  }, [languageAndOptions]);

  if (!parsedLanguageAndOptions) {
    return null;
  }

  const { language, highlightLines } = parsedLanguageAndOptions;

  return (
    <PrismSyntaxHighlighter
      language={language}
      useInlineStyles={false}
      codeTagProps={{ className: "flex flex-col flex-1" }}
      renderer={createRenderer(highlightLines)}
    >
      {children}
    </PrismSyntaxHighlighter>
  );
};
