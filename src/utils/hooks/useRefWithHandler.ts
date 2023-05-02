"use client";

import {
  DependencyList,
  ForwardedRef,
  RefCallback,
  useCallback,
  useEffect,
  useRef,
} from "react";
import useOpaqueRef from "./useOpaqueRef";

export default function useRefWithHandler<T>(
  handler: (value: T) => void,
  forwardedRef?: ForwardedRef<T>,
  deps?: DependencyList
): RefCallback<T> {
  const handlerRef = useOpaqueRef(handler);
  const realRef = useRef<T | null>();

  useEffect(
    () => {
      const instance = realRef.current;
      if (instance) {
        handlerRef.current(instance);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [realRef, ...(deps || [])]
  );

  return useCallback(
    (instance: T | null) => {
      realRef.current = instance;
      if (forwardedRef) {
        if ("call" in forwardedRef) {
          forwardedRef(instance);
        } else {
          forwardedRef.current = instance;
        }
      }
      if (instance) {
        handlerRef.current(instance);
      }
    },
    [forwardedRef, handlerRef, realRef]
  );
}
