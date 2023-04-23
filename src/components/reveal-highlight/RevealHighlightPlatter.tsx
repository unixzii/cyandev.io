import { useCallback, useMemo, useReducer } from "react";
import {
  RevealHighlightPlatterContextProvider,
  ElementState,
  ELEMENT_STATE_ENTERED,
  ELEMENT_STATE_DOWN,
} from "./context";
import { DefaultRevealHighlight } from "./DefaultRevealHighlight";

type RevealHighlightPlatterState = {
  hoveredElement: HTMLElement | null;
  pressedElement: HTMLElement | null;
};

type RevealHighlightPlatterAction =
  | { enter: HTMLElement }
  | { leave: HTMLElement }
  | { down: HTMLElement }
  | { up: true };

function revealHighlightPlatterReducer(
  prevState: RevealHighlightPlatterState,
  action: RevealHighlightPlatterAction
): RevealHighlightPlatterState {
  if ("enter" in action) {
    const { enter: hoveredElement } = action;
    const { pressedElement: oldPressedElement } = prevState;
    let pressedElement = oldPressedElement;
    if (hoveredElement && hoveredElement !== oldPressedElement) {
      pressedElement = null;
    }
    return { hoveredElement, pressedElement };
  } else if ("leave" in action) {
    if (prevState.hoveredElement === action.leave) {
      return { ...prevState, hoveredElement: null };
    }
  } else if ("down" in action) {
    return { hoveredElement: action.down, pressedElement: action.down };
  } else if ("up" in action) {
    return { ...prevState, pressedElement: null };
  } else {
    throw new Error(
      "Unexpected action with keys:\n" +
        Object.keys(action)
          .map((line) => `  - ${line}`)
          .join("\n")
    );
  }
  return prevState;
}

export type RevealHighlightPlatterProps = {
  className?: string;
  style?: React.CSSProperties;
  innerClassName?: string;
  innerStyle?: React.CSSProperties;
};

export function RevealHighlightPlatter(
  props: React.PropsWithChildren<RevealHighlightPlatterProps>
) {
  const { className, style, innerClassName, innerStyle, children } = props;

  const [state, dispatch] = useReducer(revealHighlightPlatterReducer, {
    hoveredElement: null,
    pressedElement: null,
  });

  const setElementState = useCallback(
    (el: HTMLElement, state: ElementState) => {
      if (state & ELEMENT_STATE_ENTERED) {
        dispatch({ enter: el });
      }
      if (state & ELEMENT_STATE_DOWN) {
        dispatch({ down: el });
      }
    },
    [dispatch]
  );
  const clearElementState = useCallback(
    (el: HTMLElement, state: ElementState) => {
      if (state & ELEMENT_STATE_ENTERED) {
        dispatch({ leave: el });
      }
      if (state & ELEMENT_STATE_DOWN) {
        dispatch({ up: true });
      }
    },
    [dispatch]
  );

  const context = useMemo(
    () => ({
      setElementState,
      clearElementState,
    }),
    [setElementState, clearElementState]
  );

  const { hoveredElement, pressedElement } = state;

  return (
    <RevealHighlightPlatterContextProvider value={context}>
      <div className={className} style={{ ...style, position: "relative" }}>
        <DefaultRevealHighlight
          width={hoveredElement?.clientWidth || 0}
          height={hoveredElement?.clientHeight || 0}
          top={hoveredElement?.offsetTop || 0}
          left={hoveredElement?.offsetLeft || 0}
          visible={!!hoveredElement}
          pressed={!!pressedElement && hoveredElement === pressedElement}
        />
        <div className={`relative ${innerClassName || ""}`} style={innerStyle}>
          {children}
        </div>
      </div>
    </RevealHighlightPlatterContextProvider>
  );
}
