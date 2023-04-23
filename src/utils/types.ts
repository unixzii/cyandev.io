import { ComponentProps } from "react";

export type MethodKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any) => any ? K : never;
}[keyof T];

export type HTMLTag = keyof JSX.IntrinsicElements;
export type HTMLTagProps<Tag extends HTMLTag> = Tag extends HTMLTag
  ? Omit<ComponentProps<Tag>, "ref">
  : never;
type HTMLTagSelectorProps<Tag extends HTMLTag> = {
  elementType?: Tag;
};
export type HTMLWrapperComponentProps<
  Tag extends HTMLTag,
  P
> = HTMLTagSelectorProps<Tag> & HTMLTagProps<Tag> & P;
