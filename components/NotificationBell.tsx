"use client"

import React, { useState } from 'react'
import { Bell, Trash2 } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

export default function NotificationBell() {
  const { notifications, markAsRead, clearAll } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)
  const [swipedNotifications, setSwipedNotifications] = useState<Set<string>>(new Set())
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return '⏰'
      case 'tip': return '💡'
      case 'achievement': return '🏆'
      case 'motivation': return '💪'
      default: return '📢'
    }
  }

  const handleSwipe = (notificationId: string) => {
    setSwipedNotifications(prev => new Set([...prev, notificationId]))
    // Remove notification after swipe animation
    setTimeout(() => {
      markAsRead(notificationId)
      setSwipedNotifications(prev => {
        const newSet = new Set(prev)
        newSet.delete(notificationId)
        return newSet
      })
    }, 300)
  }

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId)
  }

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNotifications(true)}
          className="relative p-2"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </div>

      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-md mx-auto max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Benachrichtigungen</DialogTitle>
          </DialogHeader>
          
          {/* Fixed Clear All Button at top */}
          {notifications.length > 0 && (
            <div className="flex justify-center pb-3 border-b border-gray-200 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Alle löschen
              </Button>
            </div>
          )}
          
          {/* Scrollable notifications list */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔔</div>
                <p>Keine Benachrichtigungen</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.read ? 'opacity-100' : 'opacity-60'
                  } ${
                    swipedNotifications.has(notification.id) ? 'transform translate-x-full opacity-0 transition-all duration-300' : ''
                  } cursor-pointer select-none`}
                  onClick={() => handleNotificationClick(notification.id)}
                  onTouchStart={(e) => {
                    const touch = e.touches[0]
                    const startX = touch.clientX
                    
                    const handleTouchMove = (e: TouchEvent) => {
                      const touch = e.touches[0]
                      const currentX = touch.clientX
                      const diffX = startX - currentX
                      
                      if (diffX > 50) { // Swipe left threshold
                        handleSwipe(notification.id)
                        document.removeEventListener('touchmove', handleTouchMove)
                        document.removeEventListener('touchend', handleTouchEnd)
                      }
                    }
                    
                    const handleTouchEnd = () => {
                      document.removeEventListener('touchmove', handleTouchMove)
                      document.removeEventListener('touchend', handleTouchEnd)
                    }
                    
                    document.addEventListener('touchmove', handleTouchMove)
                    document.addEventListener('touchend', handleTouchEnd)
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{notification.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(notification.timestamp, { 
                            addSuffix: true, 
                            locale: de 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-200">
                          {getTypeIcon(notification.type)} {notification.type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.priority === 'high' ? 'bg-red-200 text-red-800' :
                          notification.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 