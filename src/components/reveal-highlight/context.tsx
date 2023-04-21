import { MouseEventHandler, useContext, useEffect, createContext } from "react";
import { MethodKeys } from "@/utils/types";

export interface IRevealHighlightPlatterContext {
  setActiveElement: (el: HTMLElement | null) => void;
  handleElementEnter: MouseEventHandler;
  handleElementLeave: MouseEventHandler;
  handleElementDown: MouseEventHandler;
  handleElementUp: MouseEventHandler;
}

const RevealHighlightPlatterContext =
  createContext<IRevealHighlightPlatterContext | null>(null);

export function RevealHighlightPlatterContextProvider(
  props: React.PropsWithChildren<{ value: IRevealHighlightPlatterContext }>
) {
  const { value, children } = props;
  return (
    <RevealHighlightPlatterContext.Provider value={value}>
      {children}
    </RevealHighlightPlatterContext.Provider>
  );
}

function noop() {}
function wrapContextFn<T, K extends MethodKeys<T>>(
  context: T | null,
  fnName: K
): T[K] {
  if (context) {
    return context[fnName];
  }
  return noop as any;
}

export type UseRevealHighlight = {
  onMouseLeave: React.MouseEventHandler;
  onMouseEnter: React.MouseEventHandler;
  onMouseDown: React.MouseEventHandler;
  onMouseUp: React.MouseEventHandler;
};

export function useRevealHighlight(
  activeElement?: HTMLElement | null
): UseRevealHighlight {
  const context = useContext(RevealHighlightPlatterContext);

  const onMouseEnter = wrapContextFn(context, "handleElementEnter");
  const onMouseLeave = wrapContextFn(context, "handleElementLeave");
  const onMouseDown = wrapContextFn(context, "handleElementDown");
  const onMouseUp = wrapContextFn(context, "handleElementUp");

  useEffect(() => {
    if (activeElement === undefined) {
      return;
    }

    context?.setActiveElement(activeElement);
  }, [context, activeElement]);

  return {
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
  };
}
