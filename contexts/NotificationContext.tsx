"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { db } from '../lib/db'
import { Notification } from '../lib/types'

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load notifications from IndexedDB
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await db.init()
        const stored = await db.getAllNotifications()
        setNotifications(stored)
      } catch (error) {
        console.error('Error loading notifications:', error)
      }
    }
    loadNotifications()
  }, [])

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    try {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false
      }
      
      await db.init()
      await db.addNotification(newNotification)
      setNotifications(prev => [newNotification, ...prev])
      
      // Show toast for all notifications
      toast(notification.title, {
        description: notification.message,
        icon: notification.icon,
        duration: 4000,
        closeButton: false,
        dismissible: true,
      })
    } catch (error) {
      console.error('Error adding notification:', error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await db.init()
      await db.markNotificationAsRead(id)
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const clearAll = async () => {
    try {
      await db.init()
      await db.clearNotifications()
      setNotifications([])
    } catch (error) {
      console.error('Error clearing notifications:', error)
    }
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
} 