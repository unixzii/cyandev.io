import { ReactNode, createElement } from "react";
import { WrappedComponent, WrapperComponentProps } from "./types";

export default function renderHtmlElement<
  Tag extends WrappedComponent,
  P extends WrapperComponentProps<Tag, Record<string, any>>
>(elementType: Tag, props: P, ourProps: (keyof P)[], children?: ReactNode) {
  const innerProps: Record<string, any> = {};
  for (const key in props) {
    if (!ourProps.includes(key) && key !== "elementType") {
      innerProps[key] = props[key];
    }
  }

  return createElement(elementType, innerProps, children);
}
