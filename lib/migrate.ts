import { db } from './db'
import { TipEntry, Tag, Notification } from './types'
import { toast } from 'sonner'

interface MigrationProgress {
  stage: 'tips' | 'tags' | 'notifications' | 'complete'
  total: number
  current: number
}

export async function migrateToIndexedDB(): Promise<void> {
  if (typeof window === "undefined") return
  
  // Check if migration has already been performed
  const hasMigrated = localStorage.getItem("cashtrack-migrated-to-indexeddb")
  if (hasMigrated === "true") return

  // Create backup of localStorage data
  const backup = {
    tips: localStorage.getItem("cashtrack-tips"),
    tags: localStorage.getItem("cashtrack-tags"),
    notifications: localStorage.getItem("cashtrack-notifications")
  }

  // Show initial migration toast
  const toastId = toast.loading('Starting data migration...')

  try {
    await db.init()
    let progress: MigrationProgress = {
      stage: 'tips',
      total: 0,
      current: 0
    }

    // Migrate tips
    const storedTips = localStorage.getItem("cashtrack-tips")
    if (storedTips) {
      const tips: TipEntry[] = JSON.parse(storedTips)
      progress.total = tips.length
      for (let i = 0; i < tips.length; i++) {
        await db.addTip(tips[i])
        progress.current = i + 1
        updateProgress(progress, toastId)
      }
    }

    // Migrate tags
    progress = { stage: 'tags', total: 0, current: 0 }
    const storedTags = localStorage.getItem("cashtrack-tags")
    if (storedTags) {
      const tags: Tag[] = JSON.parse(storedTags)
      progress.total = tags.length
      for (let i = 0; i < tags.length; i++) {
        await db.addTag(tags[i])
        progress.current = i + 1
        updateProgress(progress, toastId)
      }
    }

    // Migrate notifications
    progress = { stage: 'notifications', total: 0, current: 0 }
    const storedNotifications = localStorage.getItem("cashtrack-notifications")
    if (storedNotifications) {
      const notifications: Notification[] = JSON.parse(storedNotifications)
      progress.total = notifications.length
      for (let i = 0; i < notifications.length; i++) {
        await db.addNotification(notifications[i])
        progress.current = i + 1
        updateProgress(progress, toastId)
      }
    }

    // After successful migration, clear localStorage data
    localStorage.removeItem("cashtrack-tips")
    localStorage.removeItem("cashtrack-tags")
    localStorage.removeItem("cashtrack-notifications")

    // Set migration flag
    localStorage.setItem("cashtrack-migrated-to-indexeddb", "true")
    
    // Update progress to complete
    progress = { stage: 'complete', total: 1, current: 1 }
    updateProgress(progress, toastId)

    console.log('Migration to IndexedDB completed successfully')
  } catch (error) {
    console.error('Error during migration:', error)
    
    // Show error toast
    toast.error('Migration failed. Rolling back changes...', {
      id: toastId
    })

    // Rollback: Clear IndexedDB and restore localStorage
    try {
      await rollbackMigration(backup)
      toast.success('Rollback completed successfully')
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError)
      toast.error('Rollback failed. Please contact support.')
    }

    throw error
  }
}

function updateProgress(progress: MigrationProgress, toastId: string) {
  const messages = {
    tips: 'Migrating tips data...',
    tags: 'Migrating tags...',
    notifications: 'Migrating notifications...',
    complete: 'Migration completed successfully!'
  }

  const message = progress.stage === 'complete'
    ? messages.complete
    : `${messages[progress.stage]} (${progress.current}/${progress.total})`

  if (progress.stage === 'complete') {
    toast.success(message, { id: toastId })
  } else {
    toast.loading(message, { id: toastId })
  }
}

async function rollbackMigration(backup: { tips: string | null, tags: string | null, notifications: string | null }) {
  // Clear IndexedDB stores
  await db.init()
  await Promise.all([
    db.clearTips(),
    db.clearTags(),
    db.clearNotifications()
  ])

  // Restore localStorage data
  if (backup.tips) localStorage.setItem("cashtrack-tips", backup.tips)
  if (backup.tags) localStorage.setItem("cashtrack-tags", backup.tags)
  if (backup.notifications) localStorage.setItem("cashtrack-notifications", backup.notifications)

  // Remove migration flag
  localStorage.removeItem("cashtrack-migrated-to-indexeddb")
} 