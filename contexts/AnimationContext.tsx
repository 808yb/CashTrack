"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimationContextType {
  isAnimating: boolean
  startAnimation: () => void
  endAnimation: () => void
  showLoadingOverlay: () => void
  hideLoadingOverlay: () => void
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined)

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  const startAnimation = useCallback(() => {
    setIsAnimating(true)
  }, [])

  const endAnimation = useCallback(() => {
    setIsAnimating(false)
  }, [])

  const showLoadingOverlay = useCallback(() => {
    setShowLoading(true)
  }, [])

  const hideLoadingOverlay = useCallback(() => {
    setShowLoading(false)
  }, [])

  return (
    <AnimationContext.Provider
      value={{
        isAnimating,
        startAnimation,
        endAnimation,
        showLoadingOverlay,
        hideLoadingOverlay
      }}
    >
      {children}
      
      {/* Global Loading Overlay */}
      <AnimatePresence>
        {showLoading && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                <span className="text-sm font-medium text-gray-700">Laden...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimationContext.Provider>
  )
}

export function useAnimation() {
  const context = useContext(AnimationContext)
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider')
  }
  return context
}
