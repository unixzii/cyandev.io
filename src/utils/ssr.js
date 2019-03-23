import { useState, useEffect } from 'react';

let isAbsolutelyClient = false;

export function useClientEnv() {
  const [isClient, setIsClient] = useState(isAbsolutelyClient);
  useEffect(() => {
    isAbsolutelyClient = true;
    setIsClient(true);
  }, []);

  return isClient;
}
