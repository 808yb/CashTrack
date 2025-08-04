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

  const handleNavigation = useCallback((path: string, index: number) => {
    if (pathname === path) return;
    
    try {
      setCurrentIndex(index);
      sessionStorage.setItem('navIndex', index.toString());
      router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [pathname, router]);

  const isActive = useCallback((path: string) => pathname === path, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gray-200">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center p-4 pt-8">
            <h1 className="text-2xl font-bold text-black">CashTrack</h1>
            <div className="flex items-center gap-2">
              <NotificationBell />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-24 overflow-y-auto">
        <div className="max-w-md mx-auto relative">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto">
          <div className="bg-white border-t border-gray-200 shadow-lg">
            <div className="flex justify-around py-4">
              {navigationConfig.map(({ path, icon: Icon, label, index }) => (
                <button
                  key={path}
                  className={`flex flex-col items-center gap-1 ${
                    isActive(path)
                      ? 'text-white'
                      : 'text-black'
                  }`}
                  onClick={() => handleNavigation(path, index)}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive(path) ? 'bg-primary' : 'bg-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs">{label}</span>
                </button>
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
      <AnimatedLayout>{children}</AnimatedLayout>
      <Analytics />
      <Toaster position="top-center" richColors closeButton />
    </NotificationProvider>
  )
} 