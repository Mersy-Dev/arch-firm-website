import { useState, useEffect } from 'react';
export function useScroll() {
  const [scrollY, setScrollY]   = useState(0);
  const [isAtTop, setIsAtTop]   = useState(true);
  const [scrollDir, setScrollDir] = useState<'up'|'down'>('up');
  useEffect(() => {
    let prev = 0;
    const h = () => { const y = window.scrollY; setScrollY(y); setIsAtTop(y < 10); setScrollDir(y > prev ? 'down' : 'up'); prev = y; };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return { scrollY, isAtTop, scrollDir };
}