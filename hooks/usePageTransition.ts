import { useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export interface PageTransitionOptions {
  delay?: number
  onStart?: () => void
  onComplete?: () => void
}

export function usePageTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Reset transitioning state when pathname changes
  useEffect(() => {
    setIsTransitioning(false)
  }, [pathname])

  const navigate = useCallback(async (
    path: string, 
    options: PageTransitionOptions = {}
  ) => {
    const { delay = 100, onStart, onComplete } = options

    // Don't navigate if already on the same path
    if (pathname === path) return

    // Allow navigation even if transitioning (prevents stuck state)
    try {
      setIsTransitioning(true)
      onStart?.()

      // Reduced delay for better responsiveness
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      router.push(path)
      
      // Reset transition state after navigation
      setTimeout(() => {
        setIsTransitioning(false)
        onComplete?.()
      }, 200) // Reduced timeout
    } catch (error) {
      console.error('Navigation error:', error)
      setIsTransitioning(false)
    }
  }, [router, pathname])

  const navigateWithTransition = useCallback((
    path: string,
    index: number,
    options: PageTransitionOptions = {}
  ) => {
    sessionStorage.setItem('navIndex', index.toString())
    navigate(path, options)
  }, [navigate])

  return {
    navigate,
    navigateWithTransition,
    isTransitioning
  }
}
