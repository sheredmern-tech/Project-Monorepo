// ============================================
// FILE: app/home/_hooks/use-counter-animation.ts
// ============================================
'use client'

import { useState, useEffect, useRef } from 'react'

export function useCounterAnimation(
  end: number,
  duration = 2000,
  start = 0
) {
  const [count, setCount] = useState(start)
  const [isInView, setIsInView] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold: 0.5 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isInView) return

    const increment = end / (duration / 16) // 60fps
    let current = start
    
    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isInView, end, start, duration])

  return { count, elementRef }
}