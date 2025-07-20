"use client"

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useRef, useState } from "react"
import { Calendar, Plus, User, ChevronLeft, ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate, getStoredTips, getDaySummary, updateDayNote, endShift, updateTipForDate, getStoredTags, saveTag, updateTag, deleteTag, Tag } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useConfetti } from "@/contexts/ConfettiContext"
import { useNotifications } from "@/contexts/NotificationContext"
import NotificationBell from "@/components/NotificationBell"

interface TipEntry {
  date: string
  amount: number
  note?: string
  tags?: string[]
  timestamp: number
}

export default function CalendarView() {
  const { showConfetti } = useConfetti()
  const { addNotification } = useNotifications()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tips, setTips] = useState<TipEntry[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDateNote, setSelectedDateNote] = useState<string>("")
  const [selectedDateTags, setSelectedDateTags] = useState<string[]>([])
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editAmount, setEditAmount] = useState("")
  const [showSwipeLabel, setShowSwipeLabel] = useState(true)
  const [showManageTagsDialog, setShowManageTagsDialog] = useState(false)
  const [showCustomTagDialog, setShowCustomTagDialog] = useState(false)
  const [customTagName, setCustomTagName] = useState("")
  const [customTagColor, setCustomTagColor] = useState("bg-purple-500")

  const tagColors = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
    "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-gray-600"
  ]

  // Month carousel state
  const minYear = 2022
  const [now, setNow] = useState<Date | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null)
  const [monthSlides, setMonthSlides] = useState<{ year: number; month: number }[]>([])
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps',
    skipSnaps: false,
    dragFree: false,
  })
  const didInitialScroll = useRef(false)
  useEffect(() => {
    const date = new Date()
    setNow(date)
    const currentMonth = date.getMonth()
    const currentYear = date.getFullYear()
    const maxIdx = (currentYear - minYear) * 12 + currentMonth
    const slides: { year: number; month: number }[] = []
    for (let i = 0; i <= maxIdx; i++) {
      const year = minYear + Math.floor(i / 12)
      const month = i % 12
      slides.push({ year, month })
    }
    setMonthSlides(slides)
    setSelectedMonth({ year: currentYear, month: currentMonth })
  }, [])
  // Find the index for the selected month
  const selectedIndex = selectedMonth ? (selectedMonth.year - minYear) * 12 + selectedMonth.month : 0
  // When selectedMonth changes, scroll embla to the correct slide
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
    if (slide && (!selectedMonth || slide.year !== selectedMonth.year || slide.month !== selectedMonth.month)) {
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

  // Use selectedMonth for calendar grid
  const calendarDate = selectedMonth ? new Date(selectedMonth.year, selectedMonth.month, 1) : currentDate

  useEffect(() => {
    const loadTips = () => {
      const storedTips = getStoredTips()
      setTips(storedTips)
      // If a date is already selected, update its note/amount/tags
      if (selectedDate) {
        const summary = getDaySummary(selectedDate)
        setSelectedDateNote(summary.note || "")
        setSelectedDateTags(summary.tags || [])
      }
    }

    const loadTags = () => {
      const storedTags = getStoredTags()
      setTags(storedTags)
    }

    loadTips()
    loadTags()

    // Listen for storage changes and window focus to update calendar
    const handleStorageChange = () => {
      loadTips()
      loadTags()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("focus", () => {
      loadTips()
      loadTags()
    })

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", () => {
        loadTips()
        loadTags()
      })
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

  const getTagsForDate = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")}`
    const summary = getDaySummary(dateKey)
    return summary.tags || []
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
    setSelectedDateTags([])
  }

  const handleDayClick = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")}`
    setSelectedDate(dateKey)
    const summary = getDaySummary(dateKey)
    setSelectedDateNote(summary.note || "")
    setSelectedDateTags(summary.tags || [])
  }

  const handleNoteSave = () => {
    if (selectedDate) {
      updateDayNote(selectedDate, selectedDateNote, selectedDateTags)
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
        updateTipForDate(selectedDate, roundedAmount, selectedDateNote, selectedDateTags)
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

  const toggleTag = (tagId: string) => {
    if (selectedDateTags.includes(tagId)) {
      setSelectedDateTags(selectedDateTags.filter(id => id !== tagId))
    } else {
      setSelectedDateTags([...selectedDateTags, tagId])
    }
  }

  const handleCustomTag = () => {
    if (customTagName.trim()) {
      const newTag = {
        name: customTagName.trim(),
        color: customTagColor,
      }
      saveTag(newTag)
      setTags(getStoredTags())
      setCustomTagName("")
      setCustomTagColor("bg-purple-500")
      setShowCustomTagDialog(false)
    }
  }

  // Diese Funktion löscht das Tag komplett aus dem System
  const handleDeleteTag = (tagId: string) => {
    deleteTag(tagId)
    setTags(getStoredTags())
    // Auch aus selectedDateTags entfernen, falls es dort war
    setSelectedDateTags(selectedDateTags.filter(id => id !== tagId))
  }

  const handleEditTag = (tagId: string, newName: string, newColor: string) => {
    updateTag(tagId, { name: newName, color: newColor })
    setTags(getStoredTags())
    showConfetti() // Celebrate successful tag edit
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(calendarDate)
    const firstDay = getFirstDayOfMonth(calendarDate) // 0 for Monday, 1 for Tuesday, etc.
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day)
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
        {/* Month Selector */}
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
                      <div className="bg-white rounded-2xl px-4 py-3 flex flex-col items-center">
                        <span className="flex-1 text-center text-lg font-medium mb-1">
                          {monthNames[slide.month]} {slide.year}
                        </span>
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

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="bg-white rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-black">
                {new Date(selectedDate).toLocaleDateString("de-DE", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <button
                onClick={() => {
                  setSelectedDate(null)
                  setSelectedDateNote("")
                  setSelectedDateTags([])
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Notiz:</label>
                <Textarea
                  placeholder="Notiz hinzufügen..."
                  value={selectedDateNote}
                  onChange={(e) => setSelectedDateNote(e.target.value)}
                  className="bg-gray-200"
                />
              </div>

              {/* Tags Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-black">Tags auswählen</label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowManageTagsDialog(true)}
                      className="text-xs"
                    >
                      Tags verwalten
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCustomTagDialog(true)}
                      className="text-xs"
                    >
                      + Neuer Tag
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border-2 ${
                        tag.color
                      } ${
                        selectedDateTags.includes(tag.id)
                          ? "text-white border-black ring-2 ring-black ring-offset-1"
                          : "text-white border-transparent hover:border-gray-300"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-gray-200 text-black"
                  onClick={handleNoteSave}
                >
                  Speichern
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-gray-200 text-black"
                  onClick={() => setShowEditDialog(true)}
                >
                  Betrag ändern
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Amount Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>Betrag ändern</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Neuer Betrag</label>
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9,]*"
                  placeholder="0,00"
                  value={editAmount}
                  onChange={(e) => handleNumberInput(e.target.value, setEditAmount)}
                  className="text-center text-xl"
                />
              </div>
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

        {/* Manage Tags Dialog */}
        <Dialog open={showManageTagsDialog} onOpenChange={setShowManageTagsDialog}>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>Tags verwalten</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Bearbeite oder lösche vorhandene Tags
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {tags.map((tag) => (
                  <TagManageItem
                    key={tag.id}
                    tag={tag}
                    onEdit={handleEditTag}
                    onDelete={handleDeleteTag}
                    tagColors={tagColors}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowManageTagsDialog(false)}
              >
                Schließen
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Custom Tag Dialog */}
        <Dialog open={showCustomTagDialog} onOpenChange={setShowCustomTagDialog}>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>Neuen Tag erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tag Name</label>
                <Input
                  placeholder="z.B. Bonus"
                  value={customTagName}
                  onChange={(e) => setCustomTagName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Farbe</label>
                <div className="grid grid-cols-4 gap-2">
                  {tagColors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full ${color} border-2 ${
                        customTagColor === color ? 'border-black' : 'border-transparent'
                      }`}
                      onClick={() => setCustomTagColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowCustomTagDialog(false)}>
                  Abbrechen
                </Button>
                <Button className="flex-1" onClick={handleCustomTag}>
                  Erstellen
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
    </div>
  )
}

// Tag Management Item Component
function TagManageItem({ 
  tag, 
  onEdit, 
  onDelete, 
  tagColors 
}: { 
  tag: Tag
  onEdit: (id: string, name: string, color: string) => void
  onDelete: (id: string) => void
  tagColors: string[]
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(tag.name)
  const [editColor, setEditColor] = useState(tag.color)

  const handleSave = () => {
    if (editName.trim()) {
      onEdit(tag.id, editName.trim(), editColor)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditName(tag.name)
    setEditColor(tag.color)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-1">
          {tagColors.slice(0, 4).map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full ${color} border-2 ${
                editColor === color ? 'border-black' : 'border-transparent'
              }`}
              onClick={() => setEditColor(color)}
            />
          ))}
        </div>
        <Button size="sm" onClick={handleSave}>
          ✓
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel}>
          ✕
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full ${tag.color}`}></div>
        <span className="font-medium">{tag.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(true)}
        >
          Bearbeiten
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(tag.id)}
          className="text-red-600 hover:text-red-700"
        >
          Löschen
        </Button>
      </div>
    </div>
  )
}
