"use client"

import { Analytics } from "@vercel/analytics/react"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { Toaster } from '@/components/ui/sonner'
import PageTransition from "@/components/PageTransition"
import { Plus, Home, Calendar, User } from "lucide-react"

import { useRouter, usePathname } from "next/navigation"
import NotificationBell from "@/components/NotificationBell"
import { useCallback, useEffect, useState } from "react"
import { migrateToIndexedDB } from "@/lib/migrate"
import { motion, AnimatePresence } from "framer-motion"
import { usePageTransition } from "@/hooks/usePageTransition"
import { AnimationProvider } from "@/contexts/AnimationContext"

const navigationConfig = [
  { path: '/', icon: Home, label: 'Home', index: 0 },
  { path: '/add-tips', icon: Plus, label: 'Tips', index: 1 },
  { path: '/calendar', icon: Calendar, label: 'Kalender', index: 2 },
  { path: '/profile', icon: User, label: 'Account', index: 3 }
];

function AnimatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      return parseInt(sessionStorage.getItem('navIndex') || '0', 10);
    } catch {
      return 0;
    }
  });
  
  const { navigateWithTransition, isTransitioning } = usePageTransition();

  const handleNavigation = useCallback(async (path: string, index: number) => {
    if (pathname === path || isTransitioning) return;
    
    setCurrentIndex(index);
    navigateWithTransition(path, index, {
      delay: 100,
      onStart: () => {
        // Optional: Add any pre-navigation logic here
      },
      onComplete: () => {
        // Optional: Add any post-navigation logic here
      }
    });
  }, [pathname, navigateWithTransition, isTransitioning]);

  const isActive = useCallback((path: string) => pathname === path, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gray-200">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center p-4 pt-8">
                         <h1 className="text-2xl font-bold text-black flex items-center gap-0">
               <img 
                 src="/Logo.svg" 
                 alt="CashTrack Logo" 
                 className="w-14 h-14"
               />
              CashTrack
             </h1>
            <div className="flex items-center gap-2">
              <NotificationBell />
            </div>
          </div>
        </div>
      </header>

             {/* Main Content Area */}
       <main className="flex-1 pt-24 pb-20 overflow-y-auto">
        <div className="max-w-md mx-auto relative">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto">
                     <div className="bg-white border-t border-gray-200 shadow-lg">
             <div className="flex justify-around py-2 relative">
              {/* Active indicator background */}
              <AnimatePresence mode="wait">
                {navigationConfig.map(({ path, index }) => {
                  if (isActive(path)) {
                    return (
                      <motion.div
                        key={`indicator-${path}`}
                        className="absolute top-0 left-0 w-1/4 h-full bg-primary rounded-t-lg"
                        initial={{ x: `${index * 100}%`, scale: 0 }}
                        animate={{ x: `${index * 100}%`, scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        style={{ zIndex: 0 }}
                      />
                    );
                  }
                  return null;
                })}
              </AnimatePresence>

              {/* Navigation items */}
              {navigationConfig.map(({ path, icon: Icon, label, index }) => (
                <motion.button
                  key={path}
                  className={`flex flex-col items-center gap-1 relative z-10 ${
                    isActive(path) ? 'text-white' : 'text-black'
                  }`}
                  onClick={() => handleNavigation(path, index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  disabled={isTransitioning}
                >
                                     <div
                     className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                       isActive(path) ? 'bg-primary' : 'bg-transparent'
                     }`}
                   >
                     <Icon className="w-4 h-4" />
                   </div>
                  <span className="text-xs font-medium">
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    migrateToIndexedDB().catch(console.error)
  }, [])

  return (
    <NotificationProvider>
      <AnimationProvider>
        <AnimatedLayout>{children}</AnimatedLayout>
        <Analytics />
        <Toaster position="top-center" richColors closeButton />
      </AnimationProvider>
    </NotificationProvider>
  )
} 