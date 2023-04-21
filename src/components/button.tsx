import {
  ForwardedRef,
  PropsWithChildren,
  HTMLAttributes,
  useCallback,
  useState,
  forwardRef,
  useEffect,
} from "react";
import { useRevealHighlight } from "./reveal-highlight";

export type ButtonProps = {
  // TBD.
  extraClassName?: string;
  manuallyActive?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export default forwardRef(function Button(
  props: PropsWithChildren<ButtonProps>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { extraClassName, children, manuallyActive } = props;

  const [element, setElement] = useState<HTMLDivElement | null>();
  const receiveRef = useCallback(
    (el: HTMLDivElement | null) => {
      setElement(el);
      if (ref) {
        if (ref instanceof Function) {
          ref(el);
        } else {
          ref.current = el;
        }
      }
    },
    [setElement, ref]
  );

  const revealHighlight = useRevealHighlight();

  const { setElementActive } = revealHighlight;
  const targetProps = revealHighlight.targetProps as Partial<
    typeof revealHighlight.targetProps
  >;
  if (manuallyActive !== undefined) {
    delete targetProps["onMouseEnter"];
    delete targetProps["onMouseLeave"];
  }
  useEffect(() => {
    if (!element || manuallyActive === undefined) {
      return;
    }
    setElementActive(element, manuallyActive);
  }, [element, manuallyActive, setElementActive]);

  // Extract inner props.
  const innerProps = Object.assign({}, props);
  delete innerProps["extraClassName"];
  delete innerProps["manuallyActive"];

  const baseClassName =
    "px-3 py-1.5 font-medium opacity-60 cursor-pointer transition-opacity duration-200";

  return (
    <div
      ref={receiveRef}
      className={`${baseClassName} ${
        manuallyActive ? "!opacity-100" : "hover:opacity-100"
      } ${extraClassName || ""}`}
      role="button"
      {...targetProps}
      {...innerProps}
    >
      {children}
    </div>
  );
});
