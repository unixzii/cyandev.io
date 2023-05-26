"use client";

import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

type SlotContents = Record<string, ReactNode>;
type SlotAction = { mount: string; node: ReactNode } | { unmount: string };
type ContextType = {
  contents: SlotContents;
  update: (action: SlotAction) => void;
};
const SlotContext = createContext<ContextType>({
  contents: {},
  update() {},
});

export const SlotProvider: FC<{ children?: ReactNode | undefined }> = ({
  children,
}) => {
  const [state, update] = useReducer(
    (prev: SlotContents, action: SlotAction) => {
      if ("mount" in action) {
        return {
          ...prev,
          [action.mount]: action.node,
        };
      } else if ("unmount" in action) {
        const newState = { ...prev };
        delete newState[action.unmount];
        return newState;
      }
      return prev;
    },
    {}
  );
  const contextValue: ContextType = useMemo(() => {
    return {
      contents: state,
      update,
    };
  }, [state, update]);
  return (
    <SlotContext.Provider value={contextValue}>{children}</SlotContext.Provider>
  );
};

let uniqueId = 0;

type SlotPortalFn = FC;
type SlotFn = FC<{ children: ReactNode }>;

export function registerSlot(description: string): [SlotPortalFn, SlotFn] {
  const id = ++uniqueId;
  const key = `${id}:${description}`;

  return [
    () => {
      const context = useContext(SlotContext);
      const node = context.contents[key];
      return <>{node || null}</>;
    },
    ({ children }) => {
      const { update } = useContext(SlotContext);
      useEffect(() => {
        update({ mount: key, node: children });
        return () => {
          update({ unmount: key });
        };
      }, [children, update]);

      return null;
    },
  ];
}
