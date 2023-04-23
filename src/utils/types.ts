import { JSXElementConstructor, ElementType, ComponentProps } from "react";

export type MethodKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any) => any ? K : never;
}[keyof T];

type ReactTag = keyof JSX.IntrinsicElements | JSXElementConstructor<any>;
type TheirProps<Tag extends ReactTag> = Tag extends ElementType
  ? Omit<ComponentProps<Tag>, "ref">
  : never;
export type UIComponentProps<Tag extends ReactTag, P> = {
  elementType?: Tag;
} & TheirProps<Tag> &
  P;
