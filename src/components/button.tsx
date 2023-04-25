import { ForwardedRef, PropsWithChildren, forwardRef } from "react";
import { useRefWithHandler, renderHtmlElement } from "@/utils";
import { WrappedComponent, WrapperComponentProps } from "@/utils/types";
import { useRevealHighlight, ELEMENT_STATE_ENTERED } from "./reveal-highlight";

export type ButtonProps<Comp extends WrappedComponent> = WrapperComponentProps<
  Comp,
  {
    // TBD.
    extraClassName?: string;
    active?: boolean;
  }
>;

export interface ButtonComponent {
  <Comp extends WrappedComponent = "div">(
    props: ButtonProps<Comp>
  ): JSX.Element;
}

export const Button = forwardRef(function Button<T extends WrappedComponent>(
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
      tabIndex: 0,
      ...targetProps,
      ...props,
    },
    ["extraClassName", "active", "elementType"],
    children
  );
}) as ButtonComponent;
