"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getTodayKey, getStoredTips } from '@/lib/utils'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'reminder' | 'tip' | 'achievement' | 'motivation'
  title: string
  message: string
  icon: string
  priority: 'low' | 'medium' | 'high'
  read: boolean
  timestamp: number
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  clearAll: () => void
  checkForReminders: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load notifications from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cashtrack-notifications")
      if (stored) {
        setNotifications(JSON.parse(stored))
      }
    }
  }, [])

  // Save notifications to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cashtrack-notifications", JSON.stringify(notifications))
    }
  }, [notifications])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // Show toast for all notifications (like push notifications)
    toast(notification.title, {
      description: notification.message,
      icon: notification.icon,
      duration: 4000,
    })
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  const checkForReminders = () => {
    const today = getTodayKey()
    const tips = getStoredTips()
    const todayTips = tips.filter((tip) => tip.date === today)
    const now = new Date()
    const hour = now.getHours()
    
    // Evening reminder (after 6 PM) if no tips entered, only alle 45 Minuten
    const lastReminderTimestamp = localStorage.getItem("cashtrack-last-reminder-timestamp")
    const nowTimestamp = Date.now()
    const REMINDER_DELAY = 45 * 60 * 1000 // 45 Minuten in ms
    if (hour >= 18 && todayTips.length === 0) {
      if (!lastReminderTimestamp || nowTimestamp - Number(lastReminderTimestamp) > REMINDER_DELAY) {
        addNotification({
          type: 'reminder',
          title: 'Trinkgeld vergessen?',
          message: '💡 Vergiss nicht, dein Trinkgeld einzugeben!',
          icon: '💰',
          priority: 'medium'
        })
        localStorage.setItem("cashtrack-last-reminder-timestamp", nowTimestamp.toString())
      }
    }
    
    // Morning motivation (before 10 AM) - only once per day
    const lastMorningNotification = localStorage.getItem("cashtrack-last-morning-notification")
    const todayKey = new Date().toDateString()
    if (hour < 10 && lastMorningNotification !== todayKey) {
      addNotification({
        type: 'motivation',
        title: 'Guten Morgen!',
        message: '🌅 Heute ist ein neuer Tag für Trinkgeld!',
        icon: '☀️',
        priority: 'low'
      })
      localStorage.setItem("cashtrack-last-morning-notification", todayKey)
    }
    
    // Weekly goal reminder (if weekly goal is set)
    const goalType = localStorage.getItem("cashtrack-goal-type")
    if (goalType === "weekly") {
      const weeklyData = getWeeklyTipsData(tips)
      const weeklyTotal = weeklyData.reduce((sum, day) => sum + day.tips, 0)
      const goalAmount = Number(localStorage.getItem("cashtrack-goal") || "100")
      const nowTimestamp = Date.now()
      const lastTipNotification = localStorage.getItem("cashtrack-last-tip-notification")
      const TIP_NOTIFICATION_DELAY = 6 * 60 * 60 * 1000 // 6 hours
      if (weeklyTotal > 0 && weeklyTotal < goalAmount * 0.5) {
        if (!lastTipNotification || nowTimestamp - Number(lastTipNotification) > TIP_NOTIFICATION_DELAY) {
          addNotification({
            type: 'tip',
            title: 'Wöchentliches Ziel',
            message: '🎯 Du bist auf gutem Weg! Halte durch!',
            icon: '📈',
            priority: 'low'
          })
          localStorage.setItem("cashtrack-last-tip-notification", nowTimestamp.toString())
        }
      }
    }
    
    // First time user welcome message
    const hasSeenWelcome = localStorage.getItem("cashtrack-welcome-seen")
    if (!hasSeenWelcome) {
      addNotification({
        type: 'tip',
        title: 'Willkommen bei CashTrack!',
        message: '🎉 Starte deine Trinkgeld-Tracking-Reise!',
        icon: '🚀',
        priority: 'medium'
      })
      localStorage.setItem("cashtrack-welcome-seen", "true")
    }
  }

  // Helper function to get weekly data
  const getWeeklyTipsData = (tips: any[]) => {
    const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
    const weekData = weekDays.map((day, index) => {
      const today = new Date()
      const currentDay = today.getDay()
      const mondayOffset = currentDay === 0 ? 6 : currentDay - 1
      const daysFromMonday = index - mondayOffset
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() + daysFromMonday)
      
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

  // Check for reminders every 30 minutes and on app focus
  useEffect(() => {
    checkForReminders()
    
    // Check every 30 minutes
    const interval = setInterval(checkForReminders, 30 * 60 * 1000)
    
    // Check when app gets focus (user returns to app)
    const handleFocus = () => {
      checkForReminders()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      markAsRead, 
      clearAll, 
      checkForReminders 
    }}>
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