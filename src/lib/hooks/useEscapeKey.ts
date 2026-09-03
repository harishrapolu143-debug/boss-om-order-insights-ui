import { useEffect } from 'react';

const useEscapeKey = (isActive: boolean, handler: () => void) => {
  useEffect(() => {
    if (!isActive) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler();
      }
    };

    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [isActive, handler]);
};

export default useEscapeKey;
