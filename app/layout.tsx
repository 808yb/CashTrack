import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import Head from 'next/head'
import { ConfettiProvider } from "@/contexts/ConfettiContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { Toaster } from '@/components/ui/sonner'

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
            <Toaster position="top-center" />
          </NotificationProvider>
        </ConfettiProvider>
      </body>
    </html>
  )
}
