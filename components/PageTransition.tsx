"use client"

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

// Define main navigation pages in order
const MAIN_PAGES = ['/', '/add-tips', '/calendar'];

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Determine if this is a profile page transition
  const isProfileTransition = pathname === '/profile' || prevPathname.current === '/profile';

  useEffect(() => {
    prevPathname.current = pathname;
  }, [pathname]);

  // Handle profile transitions separately with just fade
  if (isProfileTransition) {
    return (
      <div className="w-full min-h-screen bg-gray-200">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

  // Handle main navigation transitions with slides
  const currentIndex = MAIN_PAGES.indexOf(pathname);
  const prevIndex = MAIN_PAGES.indexOf(prevPathname.current);
  const direction = currentIndex > prevIndex ? 'forward' : 'backward';

  return (
    <div className="relative w-full min-h-screen bg-gray-200 overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={pathname}
          initial={{ 
            x: direction === 'forward' ? '-100%' : '-100%'
          }}
          animate={{ 
            x: 0,
            transition: {
              type: "spring",
              stiffness: 500,
              damping: 40,
              mass: 0.6
            }
          }}
          exit={{ 
            x: direction === 'forward' ? '100%' : '100%',
            transition: {
              type: "spring",
              stiffness: 500,
              damping: 40,
              mass: 0.6
            }
          }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0
          }}
          className="w-full min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}