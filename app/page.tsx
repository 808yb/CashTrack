"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, User, Home } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate, getTodayKey, getStoredTips } from "@/lib/utils"
import { useSwipeable } from 'react-swipeable'

interface TipEntry {
  date: string
  amount: number
  note?: string
}

export default function Dashboard() {
  const [tips, setTips] = useState<TipEntry[]>([])
  const [todayTotal, setTodayTotal] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [showSwipeLabel, setShowSwipeLabel] = useState(true)

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

  const getMonthTips = (year: number, month: number) => {
    // month: 0-based (0=Jan, 11=Dec)
    const monthTips = tips.filter(tip => {
      const tipDate = new Date(tip.date)
      return tipDate.getFullYear() === year && tipDate.getMonth() === month
    })
    return monthTips.reduce((sum, tip) => sum + tip.amount, 0)
  }

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"
  ]

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

    // Find highest tip of today
    const today = getTodayKey()
    const todayTips = tips.filter((tip) => tip.date === today)
    const highestTipToday = todayTips.length > 0 ? Math.max(...todayTips.map(tip => tip.amount)) : 0

    return { shifts, average, highestTipToday }
  }

  const recentShifts = getRecentShifts()
  const stats = getStats()

  // Count shifts for the selected month only
  const getMonthShifts = (year: number, month: number) => {
    const shiftsByDate = tips.reduce((acc, tip) => {
      const tipDate = new Date(tip.date)
      if (tipDate.getFullYear() === year && tipDate.getMonth() === month) {
        if (!acc[tip.date]) acc[tip.date] = 0
        acc[tip.date] += tip.amount
      }
      return acc
    }, {} as Record<string, number>)
    return Object.keys(shiftsByDate).length
  }

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

          {/* Monthly Tips Summary (Swipeable) */}
          <div
            className="bg-gray-200 rounded-2xl px-4 py-3 mb-2 flex flex-col items-center select-none"
            {...useSwipeable({
              onSwipedLeft: () => {
                // Only allow swiping left if the next month is not in the future
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                let nextMonth = selectedMonth.month + 1;
                let nextYear = selectedMonth.year;
                if (nextMonth > 11) { nextMonth = 0; nextYear++; }
                if (
                  nextYear < currentYear ||
                  (nextYear === currentYear && nextMonth <= currentMonth)
                ) {
                  setSelectedMonth(prev => {
                    let month = prev.month + 1;
                    let year = prev.year;
                    if (month > 11) { month = 0; year++; }
                    return { year, month };
                  });
                  setShowSwipeLabel(false);
                }
              },
              onSwipedRight: () => {
                setSelectedMonth(prev => {
                  let month = prev.month - 1;
                  let year = prev.year;
                  if (month < 0) { month = 11; year--; }
                  return { year, month };
                });
                setShowSwipeLabel(false);
              },
              trackMouse: true,
            })}
          >
            <span className="flex-1 text-center text-lg font-medium mb-1">
              Trinkgeld im {monthNames[selectedMonth.month]} {selectedMonth.year}
            </span>
            <div className="text-3xl font-bold text-center">
              {formatCurrency(getMonthTips(selectedMonth.year, selectedMonth.month))}
            </div>
          </div>
          {showSwipeLabel && (
            <div className="text-xs text-gray-500 mb-4 text-center">Nach links wischen, um den Vormonat zu sehen</div>
          )}

          {/* Statistics */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-black mb-2">Statistik</h3>
            <div className="text-black">
              <div>Schichten: {getMonthShifts(selectedMonth.year, selectedMonth.month)}</div>
              <div>Höchste Trinkgeld von heute: {formatCurrency(stats.highestTipToday)}</div>
            </div>
          </div>

          {/* Monthly Tips with Month Selector */}
          <div>
            {getMonthTips(selectedMonth.year, selectedMonth.month) === 0 && (
              <div className="text-gray-500 text-center py-4">Noch keine Einträge in diesem Monat</div>
            )}
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
