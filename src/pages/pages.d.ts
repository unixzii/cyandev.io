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
  interface FunctionComponent<M = global.PageMetadata> {
    staticMetadata?: M;
  }
  interface ComponentClass<M = global.PageMetadata> {
    staticMetadata?: M;
  }
}
