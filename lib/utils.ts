import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { db } from './db'
import { TipEntry, Tag } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Default tags
export const defaultTags: Tag[] = [
  { id: "rain", name: "Regen", color: "bg-blue-500" },
  { id: "holiday", name: "Feiertag", color: "bg-red-500" },
  { id: "double", name: "Schichtleitung", color: "bg-yellow-500" },
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

export async function getStoredTips(): Promise<TipEntry[]> {
  try {
    await db.init()
    return await db.getAllTips()
  } catch (error) {
    console.error('Error getting tips:', error)
    return []
  }
}

export async function getTipsByDate(date: string): Promise<TipEntry[]> {
  try {
    await db.init()
    return await db.getTipsByDate(date)
  } catch (error) {
    console.error('Error getting tips by date:', error)
    return []
  }
}

export async function saveTip(amount: number, note?: string, tags?: string[]): Promise<void> {
  try {
    await db.init()
    const newTip: TipEntry = {
      date: getTodayKey(),
      amount,
      note,
      tags,
      timestamp: Date.now(),
    }
    await db.addTip(newTip)
  } catch (error) {
    console.error('Error saving tip:', error)
  }
}

// Tag management functions with IndexedDB persistence
export async function getStoredTags(): Promise<Tag[]> {
  try {
    await db.init()
    const tags = await db.getAllTags()
    return tags.length > 0 ? tags : defaultTags
  } catch (error) {
    console.error('Error getting tags:', error)
    return defaultTags
  }
}

export async function saveTag(tag: Omit<Tag, 'id'>): Promise<void> {
  try {
    await db.init()
    const newTag: Tag = {
      ...tag,
      id: Date.now().toString(),
    }
    await db.addTag(newTag)
  } catch (error) {
    console.error('Error saving tag:', error)
  }
}

export async function deleteTag(id: string): Promise<void> {
  try {
    await db.init()
    await db.deleteTag(id)
  } catch (error) {
    console.error('Error deleting tag:', error)
  }
}

export async function updateTag(tagId: string, updates: Partial<Tag>): Promise<void> {
  try {
    await db.init()
    const tag = await db.getTag(tagId)
    if (tag) {
      const updatedTag = { ...tag, ...updates }
      await db.updateTag(updatedTag)
    }
  } catch (error) {
    console.error('Error updating tag:', error)
  }
}

// This function is used to get the consolidated tip amount and note for a specific day
export async function getDaySummary(dateKey: string): Promise<{ amount: number; note?: string; tags?: string[] }> {
  try {
    const tips = await getTipsByDate(dateKey)
    // Find the consolidated entry for the day (assuming endShift creates one)
    const dayEntry = tips.find((tip) => tip.date === dateKey)

    if (dayEntry) {
      return { amount: dayEntry.amount, note: dayEntry.note, tags: dayEntry.tags }
    } else {
      // If no consolidated entry, sum up individual tips for the day
      const totalAmount = tips.reduce((sum, tip) => sum + tip.amount, 0)
      return { amount: totalAmount }
    }
  } catch (error) {
    console.error('Error getting day summary:', error)
    return { amount: 0 }
  }
}

// This function handles ending a shift, consolidating all tips for the day into one entry
export async function endShift(amount: number, note?: string, tags?: string[]): Promise<void> {
  try {
    const today = getTodayKey()
    await db.init()
    
    // Remove any existing entries for today
    await db.deleteTipsByDate(today)

    // Add the final shift amount as a single entry if amount > 0 or there's a note or tags
    if (amount > 0 || (note && note.trim() !== "") || (tags && tags.length > 0)) {
      const shiftEntry: TipEntry = {
        date: today,
        amount,
        note: note?.trim() || undefined,
        tags,
        timestamp: Date.now(),
      }
      await db.addTip(shiftEntry)
    }
  } catch (error) {
    console.error('Error ending shift:', error)
  }
}

// This function updates the note for a specific day's consolidated entry
export async function updateDayNote(dateKey: string, newNote: string, tags?: string[]): Promise<void> {
  try {
    await db.init()
    const tips = await getTipsByDate(dateKey)
    const tip = tips.find((t) => t.date === dateKey)

    if (tip) {
      // Update existing entry's note and tags
      const updatedTip = {
        ...tip,
        note: newNote.trim() || undefined,
        tags,
        timestamp: Date.now(),
      }
      await db.updateTip(updatedTip)
    } else {
      // If no entry exists for the day, create one with 0 amount and the note
      const newTip: TipEntry = {
        date: dateKey,
        amount: 0,
        note: newNote.trim() || undefined,
        tags,
        timestamp: Date.now(),
      }
      await db.addTip(newTip)
    }
  } catch (error) {
    console.error('Error updating day note:', error)
  }
}

// This function clears all individual tips for the current day
export async function clearTodayTips(): Promise<void> {
  try {
    const today = getTodayKey()
    await db.init()
    await db.deleteTipsByDate(today)
  } catch (error) {
    console.error('Error clearing today tips:', error)
  }
}

// This function updates today's tips by clearing existing and adding a new consolidated entry
export async function updateTodayTips(newAmount: number): Promise<void> {
  try {
    // Clear today's tips first
    await clearTodayTips()

    // Add new amount if greater than 0
    if (newAmount > 0) {
      await saveTip(newAmount)
    }
  } catch (error) {
    console.error('Error updating today tips:', error)
  }
}

// Update the tip for a specific date (overwrite or create consolidated entry)
export async function updateTipForDate(dateKey: string, amount: number, note?: string, tags?: string[]): Promise<void> {
  try {
    await db.init()
    
    // Remove any existing entries for the date
    await db.deleteTipsByDate(dateKey)

    // Add the new consolidated entry if amount > 0 or there's a note or tags
    if (amount > 0 || (note && note.trim() !== "") || (tags && tags.length > 0)) {
      const entry: TipEntry = {
        date: dateKey,
        amount,
        note: note?.trim() || undefined,
        tags,
        timestamp: Date.now(),
      }
      await db.addTip(entry)
    }
  } catch (error) {
    console.error('Error updating tip for date:', error)
  }
}
