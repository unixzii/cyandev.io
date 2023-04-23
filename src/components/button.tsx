import {
  ElementType,
  ForwardedRef,
  PropsWithChildren,
  forwardRef,
  createElement,
} from "react";
import useRefWithHandler from "@/utils/useRefWithHandler";
import { UIComponentProps } from "@/utils/types";
import { useRevealHighlight, ELEMENT_STATE_ENTERED } from "./reveal-highlight";

export type ButtonProps<E extends ElementType> = UIComponentProps<
  E,
  {
    // TBD.
    extraClassName?: string;
    active?: boolean;
  }
>;

export interface ButtonComponent {
  <E extends ElementType = "div">(props: ButtonProps<E>): JSX.Element;
}

const Button = forwardRef(function Button<E extends ElementType>(
  props: PropsWithChildren<ButtonProps<E>>,
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

  // Extract inner props.
  const innerProps = Object.assign({}, props);
  delete innerProps["extraClassName"];
  delete innerProps["active"];
  delete innerProps["elementType"];

  const baseClassName =
    "px-3 py-1.5 font-medium opacity-60 cursor-pointer transition-opacity duration-200";
  const element = createElement(
    elementType || "div",
    {
      ref: innerRef,
      className: `${baseClassName} ${
        active ? "!opacity-100" : "hover:opacity-100"
      } ${extraClassName || ""}`,
      role: "button",
      ...targetProps,
      ...innerProps,
    },
    children
  );

  return element;
}) as ButtonComponent;
export default Button;
