'use client';

import * as React from 'react';

interface CountUpProps {
  end: number;
  duration?: number; // in seconds
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function CountUp({ end, duration = 0.8, prefix = '', suffix = '', decimals = 0 }: CountUpProps) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      // Easing out quad: f(t) = t * (2 - t)
      const easedProgress = progress * (2 - progress);
      const currentCount = easedProgress * end;
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [end, duration]);

  const formatted = count.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
