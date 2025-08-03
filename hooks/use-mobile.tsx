import * as React from "react"
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useMobileViewport() {
  const pathname = usePathname()

  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    const fixViewportOnTransition = () => {
      // Reset scroll position
      window.scrollTo(0, 0)
      
      // Force a reflow
      document.body.offsetHeight
      
      // Update viewport height
      setViewportHeight()
      
      // Ensure body has proper height
      document.body.style.height = '100vh'
      document.body.style.height = `calc(var(--vh, 1vh) * 100)`
    }

    // Set initial viewport height
    setViewportHeight()

    // Fix viewport on route changes
    fixViewportOnTransition()

    // Add event listeners
    window.addEventListener('resize', setViewportHeight)
    window.addEventListener('orientationchange', () => {
      setTimeout(setViewportHeight, 100)
    })

    return () => {
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
    }
  }, [pathname])

  return null
}
