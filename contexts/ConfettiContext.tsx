"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import Confetti from 'react-confetti'

interface ConfettiContextType {
  showConfetti: () => void
  hideConfetti: () => void
}

const ConfettiContext = createContext<ConfettiContextType | undefined>(undefined)

export function ConfettiProvider({ children }: { children: React.ReactNode }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [runConfetti, setRunConfetti] = useState(true)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  const [leftDone, setLeftDone] = useState(false)
  const [rightDone, setRightDone] = useState(false)

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
    setRunConfetti(true)
    setLeftDone(false)
    setRightDone(false)
    setTimeout(() => {
      setRunConfetti(false) // stop generating new pieces
    }, 1300)
  }

  useEffect(() => {
    if (leftDone && rightDone) {
      setShowConfetti(false)
    }
  }, [leftDone, rightDone])

  const hideConfetti = () => {
    setShowConfetti(false)
    setRunConfetti(false)
    setLeftDone(true)
    setRightDone(true)
  }

  return (
    <ConfettiContext.Provider value={{ showConfetti: triggerConfetti, hideConfetti }}>
      {children}
      {showConfetti && (
        <>
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            run={runConfetti}
            numberOfPieces={180}
            gravity={1.1}
            wind={0.01}
            initialVelocityY={{ min: -18, max: -22 }}
            initialVelocityX={{ min: 2, max: 16 }}
            opacity={0.85}
            confettiSource={{
              x: 0,
              y: windowDimensions.height - 10,
              w: 40,
              h: 10,
            }}
            colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
            onConfettiComplete={() => setLeftDone(true)}
          />
          <Confetti
            width={windowDimensions.width}
            height={windowDimensions.height}
            recycle={false}
            run={runConfetti}
            numberOfPieces={180}
            gravity={1.1}
            wind={-0.01}
            initialVelocityY={{ min: -18, max: -22 }}
            initialVelocityX={{ min: -16, max: -2 }}
            opacity={0.85}
            confettiSource={{
              x: windowDimensions.width - 40,
              y: windowDimensions.height - 10,
              w: 40,
              h: 10,
            }}
            colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
            onConfettiComplete={() => setRightDone(true)}
          />
        </>
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