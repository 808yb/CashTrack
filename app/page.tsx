"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, User, Home } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate, getTodayKey, getStoredTips } from "@/lib/utils"

interface TipEntry {
  date: string
  amount: number
  note?: string
}

export default function Dashboard() {
  const [tips, setTips] = useState<TipEntry[]>([])
  const [todayTotal, setTodayTotal] = useState(0)

  useEffect(() => {
    const loadTips = () => {
      const storedTips = getStoredTips()
      setTips(storedTips)

      const today = getTodayKey()
      const todayTips = storedTips.filter((tip) => tip.date === today)
      const total = todayTips.reduce((sum, tip) => sum + tip.amount, 0)
      setTodayTotal(total)
    }

    loadTips()

    // Listen for storage changes to update dashboard when returning from other pages
    const handleStorageChange = () => {
      loadTips()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", loadTips) // Reload when window gets focus

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", loadTips)
    }
  }, [])

  const getRecentShifts = () => {
    const shiftsByDate = tips.reduce(
      (acc, tip) => {
        if (!acc[tip.date]) {
          acc[tip.date] = 0
        }
        acc[tip.date] += tip.amount
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(shiftsByDate)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 5)
  }

  const getStats = () => {
    const shiftsByDate = tips.reduce(
      (acc, tip) => {
        if (!acc[tip.date]) {
          acc[tip.date] = 0
        }
        acc[tip.date] += tip.amount
        return acc
      },
      {} as Record<string, number>,
    )

    const shifts = Object.keys(shiftsByDate).length
    const totalAmount = Object.values(shiftsByDate).reduce((sum, amount) => sum + amount, 0)
    const average = shifts > 0 ? totalAmount / shifts : 0

    return { shifts, average }
  }

  const recentShifts = getRecentShifts()
  const stats = getStats()

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-200 relative">
      {/* Header */}
      <div className="flex justify-between items-center p-4 pt-8">
        <h1 className="text-2xl font-bold text-black">CashTrack</h1>
        <Link href="/profile">
          <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">
            <User className="w-6 h-6 text-white" />
          </div>
        </Link>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-20">
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-black mb-4">Dashboard</h2>

          {/* Today's Tips */}
          <div className="bg-gray-200 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-medium text-black">Trinkgeld</div>
                <div className="text-3xl font-bold text-black">{formatCurrency(todayTotal)}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-600">{formatDate(new Date())}</div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-black mb-2">Statistik</h3>
            <div className="text-black">
              <div>Schichten: {stats.shifts}</div>
              <div>Trinkgeld im Durchschnitt: {formatCurrency(stats.average)}</div>
            </div>
          </div>

          {/* Recent Shifts */}
          <div>
            <h3 className="text-xl font-bold text-black mb-4">Letzte Schichten</h3>
            <div className="space-y-3">
              {recentShifts.map(([date, amount]) => (
                <div key={date} className="flex justify-between items-center">
                  <div className="text-black">{formatDate(new Date(date))}</div>
                  <div className="text-xl font-bold text-black">{formatCurrency(amount)}</div>
                </div>
              ))}
              {recentShifts.length === 0 && (
                <div className="text-gray-500 text-center py-4">Noch keine Schichten aufgezeichnet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
        <div className="flex justify-around py-4">
          <Link href="/" className="flex flex-col items-center">
            <Home className="w-6 h-6 text-black" />
          </Link>
          <Link href="/add-tips" className="flex flex-col items-center">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </Link>
          <Link href="/calendar" className="flex flex-col items-center">
            <Calendar className="w-6 h-6 text-black" />
          </Link>
        </div>
      </div>
    </div>
  )
}
