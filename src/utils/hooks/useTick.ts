import { useState, useEffect } from "react";

export default function useTick(ms: number, initialTick?: number): number {
  const [tick, setTick] = useState(initialTick || 0);

  useEffect(() => {
    const timerId = setInterval(() => {
      setTick((prevTick) => prevTick + 1);
    }, ms);
    return () => {
      clearInterval(timerId);
    };
  }, [ms, setTick]);

  useEffect(() => {
    setTick(initialTick || 0);
  }, [initialTick, setTick]);

  return tick;
}
