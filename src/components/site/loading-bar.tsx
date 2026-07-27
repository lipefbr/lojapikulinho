'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

export function LoadingBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const fadeRef = useRef<ReturnType<typeof setTimeout>>();

  // Start loading on pathname change
  useEffect(() => {
    // Use refs to batch state updates inside a microtask
    const startBar = () => {
      setVisible(true);
      setFinishing(false);
      setProgress(0);

      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 80) return prev;
          const increment = Math.max(0.5, (80 - prev) * 0.08);
          return Math.min(prev + increment, 80);
        });
      }, 100);

      timerRef.current = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setFinishing(true);
        setProgress(100);

        fadeRef.current = setTimeout(() => {
          setVisible(false);
          setProgress(0);
          setFinishing(false);
        }, 300);
      }, 500);
    };

    // Delay start to next tick to avoid synchronous setState warning
    const id = requestAnimationFrame(startBar);

    return () => {
      cancelAnimationFrame(id);
      clearInterval(intervalRef.current);
      clearTimeout(timerRef.current);
      clearTimeout(fadeRef.current);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[3px]"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Carregando página"
    >
      <div
        className="h-full bg-tangerine shadow-[0_0_10px_rgba(255,122,69,0.5)]"
        style={{
          width: `${progress}%`,
          transition: 'width 300ms ease-out, opacity 300ms ease-out',
          opacity: finishing && progress >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
