declare namespace global {
  type PageMetadata = {
    title?: string;
    ogUrl?: string;
    ogImage?: string;
    ogDescription?: string;
    hidesNavBar?: boolean;
  };
}

declare namespace React {
  interface FunctionComponent<P = {}> {
    staticMetadata?: PageMetadata;
    getDynamicMetadata?: (props: P) => PageMetadata;
  }
  interface ComponentClass<P = {}> {
    staticMetadata?: PageMetadata;
    getDynamicMetadata?: (props: P) => PageMetadata;
  }
}
