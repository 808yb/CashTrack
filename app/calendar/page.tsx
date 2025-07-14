"use client"

import { useState, useEffect } from "react"
import { Calendar, Plus, User, ChevronLeft, ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate, getStoredTips, getDaySummary, updateDayNote, endShift, updateTipForDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface TipEntry {
  date: string
  amount: number
  note?: string
  timestamp: number
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tips, setTips] = useState<TipEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDateNote, setSelectedDateNote] = useState<string>("")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editAmount, setEditAmount] = useState("")

  useEffect(() => {
    const loadTips = () => {
      const storedTips = getStoredTips()
      setTips(storedTips)
      // If a date is already selected, update its note/amount
      if (selectedDate) {
        const summary = getDaySummary(selectedDate)
        setSelectedDateNote(summary.note || "")
      }
    }

    loadTips()

    // Listen for storage changes and window focus to update calendar
    const handleStorageChange = () => {
      loadTips()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", loadTips)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", loadTips)
    }
  }, [selectedDate]) // Re-run effect if selectedDate changes to update note

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  // Get the day of the week for the 1st of the month (0 for Sunday, 1 for Monday, etc.)
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    // Convert Sunday-start (0-6) to Monday-start (0-6, where 0=Monday, 6=Sunday)
    return day === 0 ? 6 : day - 1
  }

  const getTipAmountForDate = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")}`
    const summary = getDaySummary(dateKey)
    return summary.amount
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
    setSelectedDate(null) // Clear selected date when navigating months
    setSelectedDateNote("")
  }

  const handleDayClick = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")}`
    setSelectedDate(dateKey)
    const summary = getDaySummary(dateKey)
    setSelectedDateNote(summary.note || "")
  }

  const handleNoteSave = () => {
    if (selectedDate) {
      updateDayNote(selectedDate, selectedDateNote)
      // Re-load tips to ensure dashboard and calendar are updated
      const storedTips = getStoredTips()
      setTips(storedTips)
    }
  }

  const handleEditTips = () => {
    if (selectedDate) {
      const amount = Number.parseFloat(editAmount.replace(",", "."))
      if (!isNaN(amount) && amount >= 0) {
        // Round to 2 decimal places to avoid floating point precision issues
        const roundedAmount = Math.round(amount * 100) / 100
        // Update the tip for the selected date
        updateTipForDate(selectedDate, roundedAmount, selectedDateNote)
        setEditAmount("")
        setShowEditDialog(false)
        
        // Re-load tips to update the display
        const storedTips = getStoredTips()
        setTips(storedTips)
      }
    }
  }

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

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate) // 0 for Monday, 1 for Tuesday, etc.
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")}`
      const tipAmount = getTipAmountForDate(date)
      const isCurrentDay = isToday(date)
      const hasTips = tipAmount > 0
      const isSelected = selectedDate === dateKey

      days.push(
        <button
          key={day}
          className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            isSelected
              ? "bg-black text-white" // Selected date (black circle)
              : isCurrentDay
                ? "bg-black text-white" // Today's date (black circle)
                : hasTips
                  ? "bg-gray-300 text-black border-2 border-gray-400" // Days with tips (grey circle)
                  : "text-black hover:bg-gray-200" // Regular days
          }`}
          onClick={() => handleDayClick(date)}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ]

  const weekDays = ["M", "D", "M", "D", "F", "S", "S"] // Monday-start week (Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag)

  const selectedDaySummary = selectedDate ? getDaySummary(selectedDate) : { amount: 0, note: "" }

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
        {/* Calendar */}
        <div className="bg-white rounded-2xl p-6">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => navigateMonth("prev")} className="p-2">
              <ChevronLeft className="w-5 h-5 text-black" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-black">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
            </div>
            <button onClick={() => navigateMonth("next")} className="p-2">
              <ChevronRight className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, idx) => (
              <div key={day + idx} className="h-8 flex items-center justify-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-6">{renderCalendarDays()}</div>
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="mt-4 bg-white rounded-2xl p-4">
            <h3 className="font-medium text-black mb-2">{formatDate(new Date(selectedDate))}</h3>
            <div className="text-lg font-bold text-black mb-4">{formatCurrency(selectedDaySummary.amount)}</div>

            <div className="mb-4">
              <Button
                variant="outline"
                className="w-full bg-gray-200 text-black border-gray-300 hover:bg-gray-300"
                onClick={() => {
                  setEditAmount(selectedDaySummary.amount.toString().replace(".", ","))
                  setShowEditDialog(true)
                }}
              >
                Ändern
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notiz:</label>
              <Textarea
                placeholder="Notiz hinzufügen..."
                value={selectedDateNote}
                onChange={(e) => setSelectedDateNote(e.target.value)}
                className="bg-gray-200 mb-4"
              />
              <Button className="w-full bg-gray-200 text-black hover:bg-gray-300" onClick={handleNoteSave}>
                Notiz speichern
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Tips Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Trinkgeld bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center text-gray-600">
              {selectedDate && `Aktueller Betrag für ${formatDate(new Date(selectedDate))}: ${formatCurrency(selectedDaySummary.amount)}`}
            </div>
            <Input
              type="text"
              inputMode="decimal"
              pattern="[0-9,]*"
              placeholder="0,00"
              value={editAmount}
              onChange={(e) => handleNumberInput(e.target.value, setEditAmount)}
              className="text-center text-xl"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowEditDialog(false)}>
                Abbrechen
              </Button>
              <Button className="flex-1" onClick={handleEditTips}>
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
