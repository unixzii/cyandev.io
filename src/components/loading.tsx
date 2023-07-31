"use client";

import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { selectClass } from "@/utils";

export interface IGlobalLoadingIndicatorContext {
  startLoading(): void;
  endLoading(): void;
}

const GlobalLoadingIndicatorContext =
  createContext<IGlobalLoadingIndicatorContext | null>(null);

export function useGlobalLoadingIndicator(): IGlobalLoadingIndicatorContext {
  const context = useContext(GlobalLoadingIndicatorContext);
  return useMemo(() => {
    if (context) {
      return context;
    }

    // Return a stub when there are no providers mounted.
    return {
      startLoading() {},
      endLoading() {},
    };
  }, [context]);
}

export function GlobalLoadingIndicator({ children }: PropsWithChildren) {
  const [loadingCount, updateLoadingCount] = useReducer(
    (prev: number, action: number) => {
      const nextCount = prev + action;
      if (nextCount < 0) {
        console.error("`loadingCount` is not balanced, it's a bug in client.");
        return 0;
      }
      return prev + action;
    },
    0
  );

  const context = useMemo(() => {
    return {
      startLoading() {
        updateLoadingCount(1);
      },
      endLoading() {
        updateLoadingCount(-1);
      },
    } satisfies IGlobalLoadingIndicatorContext;
  }, [updateLoadingCount]);

  const isLoading = loadingCount > 0;

  return (
    <GlobalLoadingIndicatorContext.Provider value={context}>
      {children}
      <div
        className={selectClass({
          "absolute inset-0 w-full h-full bg-background/60 transition-opacity":
            true,
          "duration-[2s]": isLoading,
          "opacity-0 pointer-events-none duration-300": !isLoading,
        })}
      />
    </GlobalLoadingIndicatorContext.Provider>
  );
}
