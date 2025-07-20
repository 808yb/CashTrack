"use client"

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useRef, useState } from "react"
import { Calendar, Plus, User, Home } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate, getTodayKey, getStoredTips } from "@/lib/utils"
import { useSwipeable } from 'react-swipeable'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useConfetti } from "@/contexts/ConfettiContext"
import { useNotifications } from "@/contexts/NotificationContext"
import NotificationBell from "@/components/NotificationBell"
import toast from 'react-hot-toast'

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
  const [goalAmount, setGoalAmount] = useState(100)
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [newGoalAmount, setNewGoalAmount] = useState("")
  const [isWeeklyGoal, setIsWeeklyGoal] = useState(true)
  const [goalReached, setGoalReached] = useState(false)
  const { showConfetti } = useConfetti()
  const { addNotification } = useNotifications()

  // For embla carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    skipSnaps: false,
    dragFree: false,
  })

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

  // Helper function to get current week number
  const getCurrentWeekNumber = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    return Math.ceil((days + start.getDay() + 1) / 7)
  }

  // Load goal from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedGoal = localStorage.getItem("cashtrack-goal")
      const storedGoalType = localStorage.getItem("cashtrack-goal-type")
      if (storedGoal) {
        setGoalAmount(Number(storedGoal))
      }
      if (storedGoalType) {
        setIsWeeklyGoal(storedGoalType === "weekly")
      }
      
      // Initialize weekly reset tracking if not exists
      if (!localStorage.getItem("cashtrack-last-reset-week")) {
        const currentWeek = getCurrentWeekNumber()
        localStorage.setItem("cashtrack-last-reset-week", currentWeek.toString())
      }
    }
  }, [])

  // Check for goal achievement and show confetti
  useEffect(() => {
    const progressData = getProgressData()
    const hasReachedGoal = progressData.progressPercentage >= 100
    
    if (hasReachedGoal && !goalReached) {
      setGoalReached(true)
      showConfetti()
      
      // Add achievement notification
      addNotification({
        type: 'achievement',
        title: 'Ziel erreicht! 🎉',
        message: `Fantastisch! Du hast dein ${isWeeklyGoal ? 'wöchentliches' : 'globales'} Ziel von ${goalAmount}€ erreicht!`,
        icon: '🏆',
        priority: 'high'
      })
    } else if (!hasReachedGoal && goalReached) {
      setGoalReached(false)
    }
  }, [tips, goalAmount, goalReached, showConfetti, addNotification, isWeeklyGoal, goalAmount]) // Removed isWeeklyGoal from dependencies

  // Reset weekly goal when new week starts
  useEffect(() => {
    if (isWeeklyGoal) {
      const checkWeeklyReset = () => {
        const lastResetWeek = localStorage.getItem("cashtrack-last-reset-week")
        const currentWeek = getCurrentWeekNumber()
        
        if (lastResetWeek !== currentWeek.toString()) {
          // New week started, reset goal reached state
          setGoalReached(false)
          localStorage.setItem("cashtrack-last-reset-week", currentWeek.toString())
          
          // Show notification about new week
          toast('📅 Neue Woche gestartet! Dein wöchentliches Ziel wurde zurückgesetzt.', {
            duration: 4000,
            icon: '🎯',
            style: {
              background: '#363636',
              color: '#fff',
            },
          })
        }
      }
      
      checkWeeklyReset()
      
      // Check every hour for week change
      const interval = setInterval(checkWeeklyReset, 60 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [isWeeklyGoal])

  // Check for milestones and add notifications
  useEffect(() => {
    const progressData = getProgressData()
    const percentage = progressData.progressPercentage
    
    // Milestone notifications
    if (percentage >= 50 && percentage < 60) {
      addNotification({
        type: 'tip',
        title: 'Halbzeit! 🎯',
        message: `Du hast bereits ${Math.round(percentage)}% deines Ziels erreicht!`,
        icon: '📈',
        priority: 'medium'
      })
    } else if (percentage >= 75 && percentage < 85) {
      addNotification({
        type: 'motivation',
        title: 'Fast geschafft! 💪',
        message: `Nur noch ${Math.round(100 - percentage)}% bis zum Ziel!`,
        icon: '🔥',
        priority: 'medium'
      })
    }
  }, [tips, goalAmount, isWeeklyGoal, addNotification])

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

  // For embla carousel
  const [now, setNow] = useState<Date | null>(null)
  const minYear = 2022
  const minMonth = 0
  const [maxIndex, setMaxIndex] = useState<number>(0)
  const [monthSlides, setMonthSlides] = useState<{ year: number; month: number }[]>([])
  useEffect(() => {
    const date = new Date()
    setNow(date)
    const currentMonth = date.getMonth()
    const currentYear = date.getFullYear()
    const maxIdx = (currentYear - minYear) * 12 + currentMonth
    setMaxIndex(maxIdx)
    const slides: { year: number; month: number }[] = []
    for (let i = 0; i <= maxIdx; i++) {
      const year = minYear + Math.floor(i / 12)
      const month = i % 12
      slides.push({ year, month })
    }
    setMonthSlides(slides)
  }, [])
  const selectedIndex = (selectedMonth.year - minYear) * 12 + selectedMonth.month
  // When selectedMonth changes, scroll embla to the correct slide
  const didInitialScroll = useRef(false)
  useEffect(() => {
    if (emblaApi && monthSlides.length > 0 && selectedIndex >= 0 && selectedIndex < monthSlides.length) {
      if (!didInitialScroll.current) {
        emblaApi.scrollTo(selectedIndex, true) // jump, no animation
        didInitialScroll.current = true
      } else {
        emblaApi.scrollTo(selectedIndex)
      }
    }
  }, [emblaApi, selectedIndex, monthSlides.length])
  // When embla slide changes, update selectedMonth
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const idx = emblaApi.selectedScrollSnap()
    const slide = monthSlides[idx]
    if (slide && (slide.year !== selectedMonth.year || slide.month !== selectedMonth.month)) {
      setSelectedMonth({ year: slide.year, month: slide.month })
      setShowSwipeLabel(false)
    }
  }, [emblaApi, monthSlides, selectedMonth])
  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  // Get tips data for the current week
  const getWeeklyTipsData = () => {
    const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
    const weekData = weekDays.map((day, index) => {
      // Calculate the date for this day of the week (Monday = 0, Sunday = 6)
      const today = new Date()
      const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
      const mondayOffset = currentDay === 0 ? 6 : currentDay - 1 // Convert to Monday = 0
      const daysFromMonday = index - mondayOffset
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() + daysFromMonday)
      
      // Get tips for this specific day
      const dateKey = `${targetDate.getFullYear()}-${(targetDate.getMonth() + 1).toString().padStart(2, "0")}-${targetDate.getDate().toString().padStart(2, "0")}`
      const dayTips = tips.filter(tip => tip.date === dateKey)
      const totalTips = dayTips.reduce((sum, tip) => sum + tip.amount, 0)
      
      return {
        day,
        tips: totalTips,
        date: dateKey
      }
    })
    
    return weekData
  }

  const weeklyData = getWeeklyTipsData()

  const getProgressData = () => {
    if (isWeeklyGoal) {
      // Weekly goal logic
      const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.tips, 0)
      const progressPercentage = Math.min((weeklyTotal / goalAmount) * 100, 100)
      return {
        total: weeklyTotal,
        remaining: Math.max(0, goalAmount - weeklyTotal),
        progressPercentage
      }
    } else {
      // Global goal logic - sum all tips from all time
      const allTimeTotal = tips.reduce((sum, tip) => sum + tip.amount, 0)
      const progressPercentage = Math.min((allTimeTotal / goalAmount) * 100, 100)
      return {
        total: allTimeTotal,
        remaining: Math.max(0, goalAmount - allTimeTotal),
        progressPercentage
      }
    }
  }

  const progressData = getProgressData()

  // Input validation for numbers and comma only
  const handleNumberInput = (value: string, setter: (value: string) => void) => {
    // Only allow numbers, comma, and backspace
    const regex = /^[0-9,]*$/
    if (regex.test(value) || value === "") {
      // Limit to 2 decimal places
      const parts = value.split(",")
      if (parts.length <= 2 && (parts[1]?.length || 0) <= 2) {
        setter(value)
      }
    }
  }

  const handleGoalTypeChange = useCallback((checked: boolean) => {
    const newIsWeekly = !checked
    setIsWeeklyGoal(newIsWeekly)
    localStorage.setItem("cashtrack-goal-type", newIsWeekly ? "weekly" : "global")
  }, [])

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-200 relative">
      {/* Header */}
      <div className="flex justify-between items-center p-4 pt-8">
        <h1 className="text-2xl font-bold text-black">CashTrack</h1>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link href="/profile">
            <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">
              <User className="w-6 h-6 text-white" />
            </div>
          </Link>
        </div>
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

          {/* Monthly Tips Summary (Animated Carousel) */}
          {now && monthSlides.length > 0 && (
            <>
              <div className="mb-2">
                <div ref={emblaRef} className="overflow-hidden">
                  <div className="flex" style={{ userSelect: 'none' }}>
                    {monthSlides.map((slide, idx) => (
                      <div
                        key={slide.year + '-' + slide.month}
                        className="flex-shrink-0 w-full px-2"
                        style={{ minWidth: '100%', maxWidth: '100%' }}
                      >
                        <div className="bg-gray-200 rounded-2xl px-4 py-3 flex flex-col items-center">
                          <span className="flex-1 text-center text-lg font-medium mb-1">
                            Trinkgeld im {monthNames[slide.month]} {slide.year}
                          </span>
                          <div className="text-3xl font-bold text-center">
                            {formatCurrency(getMonthTips(slide.year, slide.month))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {showSwipeLabel && (
                <div className="text-xs text-gray-500 mb-4 text-center">Nach rechts wischen, um den Vormonat zu sehen</div>
              )}
            </>
          )}

          {/* Statistics */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-black mb-2">Statistik</h3>
            <div className="text-black">
              <div>Schichten: {getMonthShifts(selectedMonth.year, selectedMonth.month)}</div>
              <div>Höchste Trinkgeld von heute: {formatCurrency(stats.highestTipToday)}</div>
            </div>
          </div>

          {/* Weekly Tips Chart */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-black mb-4">Wöchentliche Übersicht</h3>
            <div className="bg-white rounded-xl p-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}€`, 'Trinkgeld']}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      backgroundColor: '#F3F4F6',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="tips" 
                    fill="#374151"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                    animationBegin={0}
                    onClick={(data) => {
                      // The tooltip will automatically show on click
                      console.log('Clicked on:', data)
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Weekly Total */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-black">Gesamt diese Woche:</span>
                  <span className="text-2xl font-bold text-black">
                    {formatCurrency(weeklyData.reduce((sum, day) => sum + day.tips, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-black mb-4">Ziel</h3>
            <div className="bg-white rounded-xl p-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {isWeeklyGoal ? "Wöchentliches Ziel" : "Globales Ziel"}
                  </span>
                  <span className="text-sm font-bold text-black">{formatCurrency(goalAmount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-black h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressData.progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">0€</span>
                  <span className="text-xs text-gray-500">{formatCurrency(goalAmount)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{formatCurrency(progressData.total)}</div>
                  <div className="text-sm text-gray-500">
                    {isWeeklyGoal ? "Gesammelt diese Woche" : "Gesammelt insgesamt"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{formatCurrency(progressData.remaining)}</div>
                  <div className="text-sm text-gray-500">Noch zu erreichen</div>
                </div>
              </div>

              {/* Goal Type Switcher */}
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black">Wöchentlich</span>
                  <Switch
                    checked={!isWeeklyGoal}
                    onCheckedChange={handleGoalTypeChange}
                  />
                  <span className="text-sm font-medium text-black">Global</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setNewGoalAmount(goalAmount.toString().replace(".", ","))
                  setShowGoalDialog(true)
                }}
                className="w-full mt-4 bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Ziel ändern
              </button>
            </div>
          </div>

          {/* Goal Setting Dialog */}
          <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
            <DialogContent className="max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle>Ziel setzen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center text-gray-600">
                  Aktuelles Ziel: {formatCurrency(goalAmount)}
                </div>
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9,]*"
                  placeholder="0,00"
                  value={newGoalAmount}
                  onChange={(e) => handleNumberInput(e.target.value, setNewGoalAmount)}
                  className="text-center text-xl"
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowGoalDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      const amount = Number.parseFloat(newGoalAmount.replace(",", "."))
                      if (!isNaN(amount) && amount > 0) {
                        const roundedAmount = Math.round(amount * 100) / 100
                        setGoalAmount(roundedAmount)
                        // Save to localStorage
                        localStorage.setItem("cashtrack-goal", roundedAmount.toString())
                        setNewGoalAmount("")
                        setShowGoalDialog(false)
                      }
                    }}
                  >
                    Speichern
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
