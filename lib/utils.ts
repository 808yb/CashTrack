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
    let tags = await db.getAllTags()
    if (tags.length === 0) {
      // Only insert default tags if the store is completely empty
      for (const tag of defaultTags) {
        await db.addTag(tag)
      }
      tags = await db.getAllTags()
    }
    return tags
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
    
    if (tips.length > 0) {
      // If there are multiple tips, find the one with the highest amount (main entry)
      // or just return the first one if they're all the same
      const mainEntry = tips.reduce((max, tip) => tip.amount > max.amount ? tip : max, tips[0])
      return { amount: mainEntry.amount, note: mainEntry.note, tags: mainEntry.tags }
    } else {
      // If no tips exist for this date
      return { amount: 0 }
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
    
    // Clear all existing tips for this date first to prevent duplicates
    await db.deleteTipsByDate(dateKey)
    
    // Find the tip with the highest amount (the main entry)
    const mainTip = tips.reduce((max, tip) => tip.amount > max.amount ? tip : max, tips[0])
    
    if (mainTip) {
      // Update existing entry's note and tags, keeping the original amount
      const updatedTip: TipEntry = {
        ...mainTip,
        note: newNote.trim() || undefined,
        tags,
        timestamp: Date.now(),
      }
      await db.addTip(updatedTip)
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
    
    // Clear all existing tips for this date first to prevent duplicates
    await db.deleteTipsByDate(dateKey)
    
    // Add new consolidated tip if amount is greater than 0
    if (amount > 0) {
      const newTip: TipEntry = {
        date: dateKey,
        amount,
        note,
        tags,
        timestamp: Date.now(),
      }
      await db.addTip(newTip)
    }
  } catch (error) {
    console.error('Error updating tip for date:', error)
  }
}

/**
 * Removes duplicate tips based on date and amount combination.
 * Keeps the first occurrence of each unique date|amount pair.
 */
export function removeDuplicates(tips: TipEntry[]): TipEntry[] {
  const seen = new Set<string>()
  return tips.filter(tip => {
    const key = `${tip.date}|${tip.amount}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Validates and transforms imported tip data, removing duplicates automatically.
 * Returns an array of valid TipEntry objects with duplicates removed.
 */
export function validateAndDeduplicateImportedTips(importedData: any[]): TipEntry[] {
  // Validate and transform imported data
  const validTips: TipEntry[] = importedData
    .filter((item) => item.date && typeof item.amount === "number" && item.timestamp)
    .map((item) => ({
      date: item.date,
      amount: item.amount,
      note: item.note || undefined,
      tags: Array.isArray(item.tags) ? item.tags : [],
      timestamp: item.timestamp,
    }))

  // Remove duplicates and return
  return removeDuplicates(validTips)
}

/**
 * Clean up duplicate tips for a specific date by keeping only the main entry
 * (the one with the highest amount) and removing all others.
 */
export async function cleanupDuplicateTipsForDate(dateKey: string): Promise<void> {
  try {
    await db.init()
    const tips = await getTipsByDate(dateKey)
    
    if (tips.length > 1) {
      // Find the tip with the highest amount (main entry)
      const mainTip = tips.reduce((max, tip) => tip.amount > max.amount ? tip : max, tips[0])
      
      // Clear all tips for this date
      await db.deleteTipsByDate(dateKey)
      
      // Add back only the main tip
      await db.addTip(mainTip)
    }
  } catch (error) {
    console.error('Error cleaning up duplicate tips for date:', error)
  }
}

/**
 * Clean up all duplicate tips in the database by keeping only the main entry
 * for each date (the one with the highest amount).
 */
export async function cleanupAllDuplicateTips(): Promise<void> {
  try {
    await db.init()
    const allTips = await getAllTips()
    
    // Group tips by date
    const tipsByDate = new Map<string, TipEntry[]>()
    allTips.forEach(tip => {
      if (!tipsByDate.has(tip.date)) {
        tipsByDate.set(tip.date, [])
      }
      tipsByDate.get(tip.date)!.push(tip)
    })
    
    // Clean up duplicates for each date
    for (const [dateKey, tips] of tipsByDate) {
      if (tips.length > 1) {
        await cleanupDuplicateTipsForDate(dateKey)
      }
    }
  } catch (error) {
    console.error('Error cleaning up all duplicate tips:', error)
  }
}

export type { Tag } from "./types";
