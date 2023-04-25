import { ReactNode, createElement } from "react";
import { HTMLTag, HTMLWrapperComponentProps } from "./types";

export default function renderHtmlElement<
  Tag extends HTMLTag,
  P extends HTMLWrapperComponentProps<Tag, Record<string, any>>
>(elementType: Tag, props: P, ourProps: (keyof P)[], children?: ReactNode) {
  const innerProps: Record<string, any> = {};
  for (const key in props) {
    if (!ourProps.includes(key) && key !== "elementType") {
      innerProps[key] = props[key];
    }
  }

  return createElement(elementType, innerProps, children);
}
