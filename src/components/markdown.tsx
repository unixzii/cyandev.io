import { FC } from "react";
import PrismSyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism";

type SyntaxHighlighterProps = {
  language: string;
  children: string;
};

export const SyntaxHighlighter: FC<SyntaxHighlighterProps> = ({
  language,
  children,
}) => {
  return (
    <PrismSyntaxHighlighter language={language} style={{ hljs: {} }}>
      {children}
    </PrismSyntaxHighlighter>
  );
};
