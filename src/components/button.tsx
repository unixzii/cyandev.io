import { ForwardedRef, PropsWithChildren, forwardRef } from "react";
import { useRefWithHandler, renderHtmlElement } from "@/utils";
import { HTMLTag, HTMLWrapperComponentProps } from "@/utils/types";
import { useRevealHighlight, ELEMENT_STATE_ENTERED } from "./reveal-highlight";

export type ButtonProps<Tag extends HTMLTag> = HTMLWrapperComponentProps<
  Tag,
  {
    // TBD.
    extraClassName?: string;
    active?: boolean;
  }
>;

export interface ButtonComponent {
  <Tag extends HTMLTag = "div">(props: ButtonProps<Tag>): JSX.Element;
}

export const Button = forwardRef(function Button<T extends HTMLTag>(
  props: PropsWithChildren<ButtonProps<T>>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { elementType, extraClassName, children, active } = props;

  const revealHighlight = useRevealHighlight();
  const innerRef = useRefWithHandler(
    (el: HTMLDivElement) => {
      if (active === true) {
        revealHighlight.setElementState(el, ELEMENT_STATE_ENTERED);
      } else if (active === false) {
        revealHighlight.clearElementState(el, ELEMENT_STATE_ENTERED);
      }
    },
    ref,
    [active]
  );

  const targetProps = revealHighlight.targetProps as Partial<
    typeof revealHighlight.targetProps
  >;
  if (active !== undefined) {
    delete targetProps["onMouseEnter"];
    delete targetProps["onMouseLeave"];
  }

  const baseClassName =
    "px-3 py-1.5 font-medium opacity-60 cursor-pointer transition-opacity duration-200";

  return renderHtmlElement(
    elementType || "div",
    {
      ref: innerRef,
      className: `${baseClassName} ${
        active ? "!opacity-100" : "hover:opacity-100"
      } ${extraClassName || ""}`,
      role: "button",
      ...targetProps,
      ...props,
    },
    ["extraClassName", "active", "elementType"],
    children
  );
}) as ButtonComponent;
