import {
  PropsWithChildren,
  MouseEventHandler,
  MouseEvent,
  SyntheticEvent,
  useCallback,
  useContext,
  createContext,
} from "react";
import { MethodKeys } from "@/utils/types";

export type ElementState = number;
export const ELEMENT_STATE_ENTERED: ElementState = 1;
export const ELEMENT_STATE_DOWN: ElementState = 1 << 1;
export const ELEMENT_STATE_ALL: ElementState =
  ELEMENT_STATE_ENTERED | ELEMENT_STATE_DOWN;

export interface IRevealHighlightPlatterContext {
  setElementState: (el: HTMLElement, state: ElementState) => void;
  clearElementState: (el: HTMLElement, state: ElementState) => void;
}

const RevealHighlightPlatterContext =
  createContext<IRevealHighlightPlatterContext | null>(null);

export function RevealHighlightPlatterContextProvider(
  props: PropsWithChildren<{ value: IRevealHighlightPlatterContext }>
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

function withHTMLEventTarget<R>(
  ev: SyntheticEvent,
  action: (el: HTMLElement) => R
): R | null {
  const target = ev.currentTarget;
  if (target instanceof HTMLElement) {
    return action(target);
  }
  return null;
}

export type UseRevealHighlight = {
  setElementState: (el: HTMLElement, state: ElementState) => void;
  clearElementState: (el: HTMLElement, state: ElementState) => void;
  targetProps: {
    onMouseLeave: MouseEventHandler;
    onMouseEnter: MouseEventHandler;
    onMouseDown: MouseEventHandler;
    onMouseUp: MouseEventHandler;
  };
};

export function useRevealHighlight(): UseRevealHighlight {
  const context = useContext(RevealHighlightPlatterContext);

  const setElementState = wrapContextFn(context, "setElementState");
  const clearElementState = wrapContextFn(context, "clearElementState");
  const onMouseEnter = useCallback(
    (ev: MouseEvent) => {
      withHTMLEventTarget(ev, (el) => {
        context?.setElementState(el, ELEMENT_STATE_ENTERED);
      });
    },
    [context]
  );
  const onMouseLeave = useCallback(
    (ev: MouseEvent) => {
      withHTMLEventTarget(ev, (el) => {
        context?.clearElementState(el, ELEMENT_STATE_ALL);
      });
    },
    [context]
  );
  const onMouseDown = useCallback(
    (ev: MouseEvent) => {
      withHTMLEventTarget(ev, (el) => {
        context?.setElementState(el, ELEMENT_STATE_DOWN);
      });
    },
    [context]
  );
  const onMouseUp = useCallback(
    (ev: MouseEvent) => {
      withHTMLEventTarget(ev, (el) => {
        context?.clearElementState(el, ELEMENT_STATE_DOWN);
      });
    },
    [context]
  );

  return {
    setElementState,
    clearElementState,
    targetProps: {
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
    },
  };
}
