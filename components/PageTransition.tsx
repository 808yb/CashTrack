"use client"

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState, useRef } from "react";

// Define the order and relationships of pages
const pages = ["/", "/add-tips", "/calendar"];

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const previousPathRef = useRef(pathname);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    
    if (pathname !== previousPath) {
      // Calculate direction based on page indices
      const currentIndex = pages.indexOf(pathname);
      const prevIndex = pages.indexOf(previousPath);
      
      let isMovingForward = true;
      
      // Only calculate direction if both pages are in our defined pages array
      if (currentIndex !== -1 && prevIndex !== -1) {
        isMovingForward = currentIndex > prevIndex;
      }
      
      setDirection(isMovingForward ? 'forward' : 'backward');
      previousPathRef.current = pathname;
    }
  }, [pathname]);

  return (
    <div className="relative isolate">
      <AnimatePresence initial={false} mode="wait">
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
                stiffness: 400,
                damping: 40,
                mass: 1
              },
              opacity: {
                duration: 0.2
              }
            }
          }}
          exit={{ 
            x: direction === 'forward' ? "-100%" : "100%",
            opacity: 0,
            transition: {
              x: {
                type: "spring",
                stiffness: 400,
                damping: 40,
                mass: 1
              },
              opacity: {
                duration: 0.15
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