import { useEffect } from 'react';

const useClickOutside = <T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  isActive: boolean,
  handler: () => void
) => {
  useEffect(() => {
    if (!isActive) return;

    const listener = (event: PointerEvent) => {
      if (!ref.current) return;
      if (ref.current.contains(event.target as Node)) return;
      handler();
    };

    document.addEventListener('pointerdown', listener);

    return () => {
      document.removeEventListener('pointerdown', listener);
    };
  }, [isActive, handler, ref]);
};

export default useClickOutside;
