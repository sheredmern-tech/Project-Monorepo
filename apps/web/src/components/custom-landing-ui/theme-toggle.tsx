// ============================================
// FILE: app/home/_components/ui/theme-toggle.tsx
// UPDATED: PHASE 3 - Fixed centering issue, B&W colors
// ============================================
'use client'

import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@/lib/hooks/use-theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-7 bg-slate-200 dark:bg-slate-700 rounded-full p-1 transition-colors flex items-center"
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {/* Toggle Indicator - NOW CENTERED */}
      <motion.div
        className="w-5 h-5 bg-slate-900 dark:bg-white rounded-full shadow-md flex items-center justify-center"
        animate={{
          x: theme === 'dark' ? 28 : 0
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {theme === 'dark' ? (
          <Moon className="w-3 h-3 text-white" />
        ) : (
          <Sun className="w-3 h-3 text-slate-900" />
        )}
      </motion.div>
    </motion.button>
  )
}
