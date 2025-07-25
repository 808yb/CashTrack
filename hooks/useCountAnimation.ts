import { useState, useEffect, useRef } from 'react';

interface UseCountAnimationProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
}

export const useCountAnimation = ({ 
  end, 
  start = 0, 
  duration = 1000,
  decimals = 2
}: UseCountAnimationProps) => {
  const [count, setCount] = useState(start);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    // Reset start time when end value changes
    startTimeRef.current = undefined;
    
    // Cancel any existing animation
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    // Animate function
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      // Calculate current value
      const currentValue = start + (end - start) * easeOutQuart;
      
      // Round to specified decimal places
      const roundedValue = Number(currentValue.toFixed(decimals));
      setCount(roundedValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, start, duration, decimals]);

  return count;
}; 