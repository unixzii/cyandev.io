import { ReactNode, createElement } from "react";
import { HTMLTag, HTMLWrapperComponentProps } from "./types";

export default function renderHtmlElement<
  Tag extends HTMLTag,
  P extends HTMLWrapperComponentProps<Tag, {}>
>(elementType: Tag, props: P, ourProps: (keyof P)[], children?: ReactNode) {
  const innerProps = Object.assign({}, props);
  for (const ourProp of ourProps) {
    delete innerProps[ourProp];
  }
  delete innerProps["elementType"];

  return createElement(elementType, innerProps, children);
}
