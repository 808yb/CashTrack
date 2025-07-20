import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import Head from 'next/head'
import { ConfettiProvider } from "@/contexts/ConfettiContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CashTrack - Tip Tracker",
  description: "Track your daily cash tips easily",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' }
    ]
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CashTrack'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <Head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CashTrack" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#f3f4f6" />
        <link rel="icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body className={inter.className}>
        <ConfettiProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-gray-200">{children}</div>
            <Analytics />
            
            {/* Global Toast Notifications with Swipe Support */}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  maxWidth: '90vw',
                  userSelect: 'none',
                  touchAction: 'pan-y',
                },
                className: 'swipeable-toast',
              }}
            />
          </NotificationProvider>
        </ConfettiProvider>
        
        {/* Swipe-to-dismiss script for toast notifications */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function initSwipeableToasts() {
                  const toasts = document.querySelectorAll('.swipeable-toast');
                  
                  toasts.forEach(toast => {
                    if (toast.dataset.swipeInitialized) return;
                    toast.dataset.swipeInitialized = 'true';
                    
                    let startX = 0;
                    let currentX = 0;
                    let isDragging = false;
                    
                    function handleTouchStart(e) {
                      startX = e.touches[0].clientX;
                      isDragging = true;
                      toast.style.transition = 'none';
                    }
                    
                    function handleTouchMove(e) {
                      if (!isDragging) return;
                      e.preventDefault();
                      
                      currentX = e.touches[0].clientX;
                      const diffX = currentX - startX;
                      
                      if (diffX < 0) { // Only allow left swipe
                        toast.style.transform = \`translateX(\${diffX}px)\`;
                      }
                    }
                    
                    function handleTouchEnd() {
                      if (!isDragging) return;
                      isDragging = false;
                      
                      const diffX = currentX - startX;
                      
                      if (diffX < -50) { // Swipe threshold
                        toast.classList.add('swiped');
                        setTimeout(() => {
                          const closeButton = toast.querySelector('[data-testid="toast-close"]');
                          if (closeButton) {
                            closeButton.click();
                          }
                        }, 300);
                      } else {
                        toast.style.transform = 'translateX(0)';
                        toast.style.transition = 'transform 0.3s ease-out';
                      }
                    }
                    
                    toast.addEventListener('touchstart', handleTouchStart, { passive: false });
                    toast.addEventListener('touchmove', handleTouchMove, { passive: false });
                    toast.addEventListener('touchend', handleTouchEnd);
                  });
                }
                
                // Initialize on load
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', initSwipeableToasts);
                } else {
                  initSwipeableToasts();
                }
                
                // Watch for new toasts
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                      mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                          const toasts = node.querySelectorAll ? node.querySelectorAll('.swipeable-toast') : [];
                          if (toasts.length > 0) {
                            setTimeout(initSwipeableToasts, 100);
                          }
                        }
                      });
                    }
                  });
                });
                
                observer.observe(document.body, {
                  childList: true,
                  subtree: true
                });
              })();
            `
          }}
        />
      </body>
    </html>
  )
}
