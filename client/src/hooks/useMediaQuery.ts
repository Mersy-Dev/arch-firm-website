import { useState, useEffect } from 'react';
export function useMediaQuery(query: string) {
  const [m, setM] = useState(() => window.matchMedia(query).matches);
  useEffect(() => { const mq = window.matchMedia(query); const h = (e: MediaQueryListEvent) => setM(e.matches); mq.addEventListener('change', h); return () => mq.removeEventListener('change', h); }, [query]);
  return m;
}
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');