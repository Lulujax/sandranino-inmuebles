'use client';

import React, { useEffect, useState } from 'react';
import { useMotionValue, animate, useReducedMotion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 0.9,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    // Normalizar duración si se pasó en ms (> 10) a segundos
    const durationInSeconds = duration > 10 ? duration / 1000 : duration;

    const controls = animate(count, value, {
      duration: durationInSeconds,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [value, duration, count, shouldReduceMotion]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString('es-VE')}
      {suffix}
    </span>
  );
};
