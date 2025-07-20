"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import toast from 'react-hot-toast'

interface ConfettiContextType {
  showConfetti: () => void
  hideConfetti: () => void
}

const ConfettiContext = createContext<ConfettiContextType | undefined>(undefined)

export function ConfettiProvider({ children }: { children: React.ReactNode }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
      
      const handleResize = () => {
        setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
      }
      
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const triggerConfetti = () => {
    setShowConfetti(true)
    toast.success('🎉 Ziel erreicht! Fantastische Arbeit!')
    
    setTimeout(() => {
      setShowConfetti(false)
    }, 3000)
  }

  const hideConfetti = () => {
    setShowConfetti(false)
  }

  return (
    <ConfettiContext.Provider value={{ showConfetti: triggerConfetti, hideConfetti }}>
      {children}
      
      {/* Global Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
        />
      )}
    </ConfettiContext.Provider>
  )
}

export function useConfetti() {
  const context = useContext(ConfettiContext)
  if (context === undefined) {
    throw new Error('useConfetti must be used within a ConfettiProvider')
  }
  return context
} 