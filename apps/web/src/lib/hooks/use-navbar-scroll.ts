// ============================================
// FILE: app/home/_hooks/use-navbar-scroll.ts
// ============================================
'use client'

import { useState, useEffect } from 'react'

export function useNavbarScroll(threshold = 20) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Check if scrolled past threshold
      setIsScrolled(currentScrollY > threshold)

      // Hide/show navbar on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false)
      } else {
        // Scrolling up
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, threshold])

  return { isScrolled, isVisible }
}
