import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface TipEntry {
  date: string
  amount: number
  note?: string
  tags?: string[]
  timestamp: number
}

export interface Tag {
  id: string
  name: string
  color: string
}

// Default tags
export const defaultTags: Tag[] = [
  { id: "rain", name: "Regen", color: "bg-blue-500" },
  { id: "holiday", name: "Feiertag", color: "bg-red-500" },
  { id: "double", name: "Doppelschicht", color: "bg-green-500" },
]

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date)
}

// Get today's date key based on local time, not UTC
export function getTodayKey(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, "0")
  const day = today.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function getStoredTips(): TipEntry[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem("cashtrack-tips")
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Tag management functions with localStorage persistence
export function getStoredTags(): Tag[] {
  if (typeof window === "undefined") return defaultTags

  try {
    const stored = localStorage.getItem("cashtrack-tags")
    return stored ? JSON.parse(stored) : defaultTags
  } catch {
    return defaultTags
  }
}

export function saveTag(tag: Omit<Tag, 'id'>): void {
  if (typeof window === "undefined") return

  const tags = getStoredTags()
  const newTag: Tag = {
    ...tag,
    id: Date.now().toString(),
  }
  tags.push(newTag)
  localStorage.setItem("cashtrack-tags", JSON.stringify(tags))
}

export function updateTag(tagId: string, updates: Partial<Tag>): void {
  if (typeof window === "undefined") return

  const tags = getStoredTags()
  const index = tags.findIndex(tag => tag.id === tagId)
  
  if (index !== -1) {
    tags[index] = { ...tags[index], ...updates }
    localStorage.setItem("cashtrack-tags", JSON.stringify(tags))
  }
}

export function deleteTag(tagId: string): void {
  if (typeof window === "undefined") return

  const tags = getStoredTags()
  const filteredTags = tags.filter(tag => tag.id !== tagId)
  localStorage.setItem("cashtrack-tags", JSON.stringify(filteredTags))
}

export function saveTip(amount: number, note?: string): void {
  if (typeof window === "undefined") return

  const tips = getStoredTips()
  const newTip: TipEntry = {
    date: getTodayKey(),
    amount,
    note,
    timestamp: Date.now(),
  }

  tips.push(newTip)
  localStorage.setItem("cashtrack-tips", JSON.stringify(tips))
}

// This function is used to get the consolidated tip amount and note for a specific day
export function getDaySummary(dateKey: string): { amount: number; note?: string; tags?: string[] } {
  if (typeof window === "undefined") return { amount: 0 }

  const tips = getStoredTips()
  // Find the consolidated entry for the day (assuming endShift creates one)
  const dayEntry = tips.find((tip) => tip.date === dateKey)

  if (dayEntry) {
    return { amount: dayEntry.amount, note: dayEntry.note, tags: dayEntry.tags }
  } else {
    // If no consolidated entry, sum up individual tips for the day
    const dayTips = tips.filter((tip) => tip.date === dateKey)
    const totalAmount = dayTips.reduce((sum, tip) => sum + tip.amount, 0)
    return { amount: totalAmount }
  }
}

// This function handles ending a shift, consolidating all tips for the day into one entry
export function endShift(amount: number, note?: string, tags?: string[]): void {
  if (typeof window === "undefined") return

  const today = getTodayKey()
  let tips = getStoredTips()

  // Remove any existing entries for today (individual tips or previous consolidated shift)
  tips = tips.filter((tip) => tip.date !== today)

  // Add the final shift amount as a single entry if amount > 0 or there's a note or tags
  if (amount > 0 || (note && note.trim() !== "") || (tags && tags.length > 0)) {
    const shiftEntry: TipEntry = {
      date: today,
      amount,
      note: note?.trim() || undefined,
      tags,
      timestamp: Date.now(),
    }
    tips.push(shiftEntry)
  }

  localStorage.setItem("cashtrack-tips", JSON.stringify(tips))
}

// This function updates the note for a specific day's consolidated entry
export function updateDayNote(dateKey: string, newNote: string, tags?: string[]): void {
  if (typeof window === "undefined") return

  const tips = getStoredTips()
  const index = tips.findIndex((tip) => tip.date === dateKey)

  if (index !== -1) {
    // Update existing entry's note and tags
    tips[index].note = newNote.trim() || undefined
    tips[index].tags = tags
  } else {
    // If no entry exists for the day, create one with 0 amount and the note
    const newTip: TipEntry = {
      date: dateKey,
      amount: 0,
      note: newNote.trim() || undefined,
      tags,
      timestamp: Date.now(),
    }
    tips.push(newTip)
  }
  localStorage.setItem("cashtrack-tips", JSON.stringify(tips))
}

// This function clears all individual tips for the current day
export function clearTodayTips(): void {
  if (typeof window === "undefined") return

  const tips = getStoredTips()
  const today = getTodayKey()
  const filteredTips = tips.filter((tip) => tip.date !== today)
  localStorage.setItem("cashtrack-tips", JSON.stringify(filteredTips))
}

// This function updates today's tips by clearing existing and adding a new consolidated entry
export function updateTodayTips(newAmount: number): void {
  if (typeof window === "undefined") return

  // Clear today's tips first
  clearTodayTips()

  // Add new amount if greater than 0
  if (newAmount > 0) {
    saveTip(newAmount)
  }
}

// Update the tip for a specific date (overwrite or create consolidated entry)
export function updateTipForDate(dateKey: string, amount: number, note?: string, tags?: string[]): void {
  if (typeof window === "undefined") return

  let tips = getStoredTips()
  // Remove any existing entries for the date
  tips = tips.filter((tip) => tip.date !== dateKey)

  // Add the new consolidated entry if amount > 0 or there's a note or tags
  if (amount > 0 || (note && note.trim() !== "") || (tags && tags.length > 0)) {
    const entry = {
      date: dateKey,
      amount,
      note: note?.trim() || undefined,
      tags,
      timestamp: Date.now(),
    }
    tips.push(entry)
  }
  localStorage.setItem("cashtrack-tips", JSON.stringify(tips))
}
