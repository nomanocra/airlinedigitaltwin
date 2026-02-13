import { useRef, useState, useCallback, useEffect } from 'react';

export function useContainerSize<T extends HTMLElement>(): [React.RefObject<T | null>, { width: number; height: number }] {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const updateSize = useCallback(() => {
    if (ref.current) {
      setSize({ width: ref.current.clientWidth, height: ref.current.clientHeight });
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateSize();
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateSize]);

  return [ref, size];
}
