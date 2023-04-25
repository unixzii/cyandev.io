import { useEffect, useRef } from "react";

export default function useOpaqueRef<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [ref, value]);
  return ref;
}
