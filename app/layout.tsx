import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CashTrack - Tip Tracker",
  description: "Track your daily cash tips easily",
  generator: 'v_0.dev',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CashTrack'
  }
}

export const viewport: Viewport = {
  themeColor: '#f3f4f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-200">{children}</div>
          <Analytics />
          <Toaster position="top-center" />
        </NotificationProvider>
      </body>
    </html>
  )
}
