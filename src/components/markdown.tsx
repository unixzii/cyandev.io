import { ComponentProps, FC, Suspense, lazy, useEffect, useState } from "react";
export { default as ReactMarkdown } from "react-markdown";

// Note: `next/dynamic` cannot be used with `Suspense`.
export const LazySyntaxHighlighter = lazy(
  () => import("react-syntax-highlighter/dist/esm/prism-async-light")
);

export const SyntaxHighlighterWithFallback: FC<
  ComponentProps<typeof LazySyntaxHighlighter>
> = (props) => {
  return (
    <Suspense
      fallback={
        <pre>
          <code>{props.children}</code>
        </pre>
      }
    >
      <LazySyntaxHighlighter {...props} />
    </Suspense>
  );
};

type ClientOnlySyntaxHighlighterProps = {
  language: string;
  children: string;
};

// A syntax highlighter component that only highlights on the client side.
export const ClientOnlySyntaxHighlighter: FC<
  ClientOnlySyntaxHighlighterProps
> = ({ language, children }) => {
  const [highlightEnabled, setHighlightEnabled] = useState(false);
  useEffect(() => {
    setHighlightEnabled(true);
  }, [setHighlightEnabled]);

  if (!highlightEnabled) {
    return (
      <pre>
        <code>{children}</code>
      </pre>
    );
  }

  return (
    <SyntaxHighlighterWithFallback language={language} style={{ hljs: {} }}>
      {children}
    </SyntaxHighlighterWithFallback>
  );
};
