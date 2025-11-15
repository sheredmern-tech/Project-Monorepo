// ============================================
// FILE: app/home/_components/ui/back-to-top.tsx
// ============================================
'use client'

import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { scrollToTop } from '@/app/home/_utils/scroll-utils'

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-colors group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUp className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}