import { TipEntry, Tag, Notification } from './types'

const DB_NAME = 'cashtrack-db'
// 2024-03-19 – bumped to 2 to ensure new object stores are created
const DB_VERSION = 2

export interface DBSchema {
  tips: TipEntry
  tags: Tag
  notifications: Notification
}

class DatabaseService {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    if (this.db) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('tips')) {
          const tipsStore = db.createObjectStore('tips', { keyPath: 'timestamp' })
          tipsStore.createIndex('date', 'date', { unique: false })
        }

        if (!db.objectStoreNames.contains('tags')) {
          db.createObjectStore('tags', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('notifications')) {
          const notificationsStore = db.createObjectStore('notifications', { keyPath: 'id' })
          notificationsStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  private getStore<T extends keyof DBSchema>(
    storeName: T,
    mode: IDBTransactionMode = 'readonly'
  ): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized')
    const transaction = this.db.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  // Tips operations
  async getAllTips(): Promise<TipEntry[]> {
    const store = this.getStore('tips')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getTipsByDate(date: string): Promise<TipEntry[]> {
    const store = this.getStore('tips')
    const index = store.index('date')
    return new Promise((resolve, reject) => {
      const request = index.getAll(date)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async addTip(tip: TipEntry): Promise<void> {
    const store = this.getStore('tips', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.add(tip)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async updateTip(tip: TipEntry): Promise<void> {
    const store = this.getStore('tips', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(tip)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async deleteTipsByDate(date: string): Promise<void> {
    const store = this.getStore('tips', 'readwrite')
    const index = store.index('date')
    return new Promise((resolve, reject) => {
      const request = index.getAllKeys(date)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const keys = request.result
        Promise.all(
          keys.map(key =>
            new Promise<void>((res, rej) => {
              const deleteRequest = store.delete(key)
              deleteRequest.onerror = () => rej(deleteRequest.error)
              deleteRequest.onsuccess = () => res()
            })
          )
        )
          .then(() => resolve())
          .catch(reject)
      }
    })
  }

  async clearTips(): Promise<void> {
    const store = this.getStore('tips', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  // Tags operations
  async getAllTags(): Promise<Tag[]> {
    const store = this.getStore('tags')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async getTag(id: string): Promise<Tag | undefined> {
    const store = this.getStore('tags')
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async addTag(tag: Tag): Promise<void> {
    const store = this.getStore('tags', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.add(tag)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async updateTag(tag: Tag): Promise<void> {
    const store = this.getStore('tags', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(tag)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async deleteTag(id: string): Promise<void> {
    const store = this.getStore('tags', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clearTags(): Promise<void> {
    const store = this.getStore('tags', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  // Notifications operations
  async getAllNotifications(): Promise<Notification[]> {
    const store = this.getStore('notifications')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async addNotification(notification: Notification): Promise<void> {
    const store = this.getStore('notifications', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.add(notification)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const store = this.getStore('notifications', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const notification = request.result
        if (notification) {
          notification.read = true
          const updateRequest = store.put(notification)
          updateRequest.onerror = () => reject(updateRequest.error)
          updateRequest.onsuccess = () => resolve()
        } else {
          reject(new Error('Notification not found'))
        }
      }
    })
  }

  async clearNotifications(): Promise<void> {
    const store = this.getStore('notifications', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

// Export a singleton instance
export const db = new DatabaseService() 