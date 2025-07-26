"use client"

import { Analytics } from "@vercel/analytics/react"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { Toaster } from '@/components/ui/sonner'
import PageTransition from "@/components/PageTransition"
import { Plus, Home, Calendar, User } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import NotificationBell from "@/components/NotificationBell"
import { useCallback, useEffect, useRef } from "react"

function AnimatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleNavigation = useCallback((path: string, index: string) => {
    if (!isMountedRef.current || pathname === path) return;
    
    try {
      sessionStorage.setItem('navIndex', index);
      router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [pathname, router]);

  const isActive = useCallback((path: string) => {
    return pathname === path;
  }, [pathname]);

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gray-200">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center p-4 pt-8">
            <h1 className="text-2xl font-bold text-black">CashTrack</h1>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link href="/profile" prefetch={false}>
                <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">
                  <User className="w-6 h-6 text-white" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area with Background */}
      <div className="min-h-screen bg-gray-200 pt-24 pb-24">
        <div className="max-w-md w-full mx-auto">
          <PageTransition>{children}</PageTransition>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto">
          <div className="bg-white border-t border-gray-200 shadow-lg">
            <div className="flex justify-around py-4">
              <button 
                className={`flex flex-col items-center transition-colors ${isActive('/') ? 'text-blue-600' : 'text-black'}`}
                onClick={() => handleNavigation('/', '0')}
              >
                <Home className="w-6 h-6" />
              </button>
              <button 
                className={`flex flex-col items-center transition-colors`}
                onClick={() => handleNavigation('/add-tips', '1')}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive('/add-tips') ? 'bg-blue-600' : 'bg-black'}`}>
                  <Plus className="w-5 h-5 text-white" />
                </div>
              </button>
              <button 
                className={`flex flex-col items-center transition-colors ${isActive('/calendar') ? 'text-blue-600' : 'text-black'}`}
                onClick={() => handleNavigation('/calendar', '2')}
              >
                <Calendar className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NotificationProvider>
      <AnimatedLayout>{children}</AnimatedLayout>
      <Analytics />
      <Toaster position="top-center" richColors closeButton />
    </NotificationProvider>
  )
} 