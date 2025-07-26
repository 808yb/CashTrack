"use client"

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState, useRef, useCallback } from "react";

// Define the order and relationships of pages
const pages = ["/", "/add-tips", "/calendar"];

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const previousPathRef = useRef(pathname);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const updateDirection = useCallback(() => {
    if (!isMountedRef.current) return;

    const previousPath = previousPathRef.current;
    
    if (pathname !== previousPath) {
      // Calculate direction based on page indices
      const currentIndex = pages.indexOf(pathname);
      const prevIndex = pages.indexOf(previousPath);
      
      // Default to forward if paths aren't in the pages array
      if (currentIndex === -1 || prevIndex === -1) {
        setDirection('forward');
      } else {
        setDirection(currentIndex > prevIndex ? 'forward' : 'backward');
      }
      
      previousPathRef.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    updateDirection();
  }, [updateDirection]);

  // Prevent animation on initial render
  const [isFirstRender, setIsFirstRender] = useState(true);
  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  if (isFirstRender) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div className="relative isolate">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ 
            x: direction === 'forward' ? "100%" : "-100%",
            opacity: 0
          }}
          animate={{ 
            x: 0,
            opacity: 1,
            transition: {
              x: {
                type: "spring",
                stiffness: 200,
                damping: 25,
                mass: 1.2
              },
              opacity: {
                duration: 0.3
              }
            }
          }}
          exit={{ 
            x: direction === 'forward' ? "-100%" : "100%",
            opacity: 0,
            transition: {
              x: {
                type: "spring",
                stiffness: 200,
                damping: 25,
                mass: 1.2
              },
              opacity: {
                duration: 0.25
              }
            }
          }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}