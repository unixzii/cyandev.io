"use client";

import { useEffect, EffectCallback, DependencyList } from "react";

export default function useDelayedEffect(
  ms: number,
  effect: EffectCallback,
  deps?: DependencyList
) {
  useEffect(
    () => {
      const timerId = [0];
      timerId[0] = window.setTimeout(() => {
        effect();
        timerId[0] = 0;
      }, ms);
      return () => {
        const [id] = timerId;
        if (id) {
          clearTimeout(id);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ms, effect, ...(deps || [])]
  );
}
