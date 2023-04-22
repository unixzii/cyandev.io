import {
  ForwardedRef,
  PropsWithChildren,
  HTMLAttributes,
  forwardRef,
} from "react";
import useRefWithHandler from "@/utils/useRefWithHandler";
import { useRevealHighlight, ELEMENT_STATE_ENTERED } from "./reveal-highlight";

export type ButtonProps = {
  // TBD.
  extraClassName?: string;
  active?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export default forwardRef(function Button(
  props: PropsWithChildren<ButtonProps>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { extraClassName, children, active } = props;

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

  const baseClassName =
    "px-3 py-1.5 font-medium opacity-60 cursor-pointer transition-opacity duration-200";

  return (
    <div
      ref={innerRef}
      className={`${baseClassName} ${
        active ? "!opacity-100" : "hover:opacity-100"
      } ${extraClassName || ""}`}
      role="button"
      {...targetProps}
      {...innerProps}
    >
      {children}
    </div>
  );
});
