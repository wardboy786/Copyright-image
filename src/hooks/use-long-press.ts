'use client';

import { useCallback, useRef, MouseEvent, TouchEvent } from 'react';

type LongPressCallback = (event: MouseEvent | TouchEvent) => void;

export const useLongPress = (
  callback: LongPressCallback,
  ms: number = 500
) => {
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      timeout.current = setTimeout(() => {
        callback(event);
      }, ms);
    },
    [callback, ms]
  );

  const clear = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
  }, []);

  return {
    onMouseDown: (e: MouseEvent) => start(e),
    onTouchStart: (e: TouchEvent) => start(e),
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
  };
};
