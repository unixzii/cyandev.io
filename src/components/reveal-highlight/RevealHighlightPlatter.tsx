import { useCallback, useEffect, useReducer } from "react";
import useOpaqueRef from "@/utils/useOpaqueRef";
import { RevealHighlightPlatterContextProvider } from "./context";
import DefaultRevealHighlight from "./DefaultRevealHighlight";

type RevealHighlightPlatterState = {
  hoveredElement: HTMLElement | null;
  mouseDown: boolean;
};

type RevealHighlightPlatterAction =
  | { enter: HTMLElement }
  | { leave: HTMLElement }
  | { down: HTMLElement }
  | { up: true }
  | { reset: true };

function revealHighlightPlatterReducer(
  prevState: RevealHighlightPlatterState,
  action: RevealHighlightPlatterAction
): RevealHighlightPlatterState {
  if ("enter" in action) {
    return { hoveredElement: action.enter, mouseDown: false };
  } else if ("leave" in action) {
    if (prevState.hoveredElement === action.leave) {
      return { hoveredElement: null, mouseDown: false };
    }
  } else if ("down" in action) {
    if (prevState.hoveredElement === action.down) {
      return { ...prevState, mouseDown: true };
    }
  } else if ("up" in action) {
    return { ...prevState, mouseDown: false };
  } else if ("reset" in action) {
    return { hoveredElement: null, mouseDown: false };
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

export default function RevealHighlightPlatter(
  props: React.PropsWithChildren<RevealHighlightPlatterProps>
) {
  const { className, style, innerClassName, innerStyle, children } = props;

  const [state, dispatch] = useReducer(revealHighlightPlatterReducer, {
    hoveredElement: null,
    mouseDown: false,
  });

  const setActiveElement = useCallback(
    (el: HTMLElement | null) => {
      dispatch(el ? { enter: el } : { reset: true });
    },
    [dispatch]
  );
  const handleElementEnter = useCallback(
    (ev: React.MouseEvent) => {
      const enter = ev.currentTarget;
      if (enter instanceof HTMLElement) {
        dispatch({ enter });
      }
    },
    [dispatch]
  );
  const handleElementLeave = useCallback(
    (ev: React.MouseEvent) => {
      const leave = ev.currentTarget;
      if (leave instanceof HTMLElement) {
        dispatch({ leave });
      }
    },
    [dispatch]
  );
  const handleElementDown = useCallback(
    (ev: React.MouseEvent) => {
      const down = ev.currentTarget;
      if (down instanceof HTMLElement) {
        dispatch({ down });
      }
    },
    [dispatch]
  );
  const handleElementUp = useCallback(
    (_ev: React.MouseEvent) => {
      dispatch({ up: true });
    },
    [dispatch]
  );

  const context = useOpaqueRef({
    setActiveElement,
    handleElementEnter,
    handleElementLeave,
    handleElementDown,
    handleElementUp,
  });

  const { hoveredElement, mouseDown } = state;

  return (
    <RevealHighlightPlatterContextProvider value={context.current}>
      <div className={className} style={{ ...style, position: "relative" }}>
        <DefaultRevealHighlight
          width={hoveredElement?.clientWidth || 0}
          height={hoveredElement?.clientHeight || 0}
          top={hoveredElement?.offsetTop || 0}
          left={hoveredElement?.offsetLeft || 0}
          visible={!!hoveredElement}
          pressed={mouseDown}
        />
        <div className={`relative ${innerClassName || ""}`} style={innerStyle}>
          {children}
        </div>
      </div>
    </RevealHighlightPlatterContextProvider>
  );
}
