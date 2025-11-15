// ============================================
// FILE: app/home/_hooks/use-scroll-progress.ts
// ============================================
'use client'

import { useState, useEffect } from 'react'

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop
      const height = 
        document.documentElement.scrollHeight - 
        document.documentElement.clientHeight
      
      const scrolled = (winScroll / height) * 100
      setProgress(scrolled)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return progress
}