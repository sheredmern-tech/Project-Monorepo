// ============================================
// FILE: app/home/_components/cards/stat-card.tsx
// UPDATED: PHASE 2 - B&W Clean Design
// Removed: Colored gradients, glow effects
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { type LucideIcon } from 'lucide-react'
import { useCounterAnimation } from '@/lib/hooks/use-counter-animation'

interface StatCardProps {
  icon: LucideIcon
  value: number
  suffix?: string
  label: string
  description: string
  color: string // Keep for backwards compatibility, but won't use
}

export function StatCard({
  icon: Icon,
  value,
  suffix = '',
  label,
  description,
}: StatCardProps) {
  const { count, elementRef } = useCounterAnimation(value, 2000)

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      <Card className="relative overflow-hidden border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white transition-all duration-300 hover:shadow-lg bg-white dark:bg-slate-950">
        <div className="relative p-6 md:p-8">
          {/* Icon - Clean B&W */}
          <div className="mb-6">
            <div className="w-14 h-14 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center">
              <Icon className="w-7 h-7 text-white dark:text-slate-900" strokeWidth={2} />
            </div>
          </div>

          {/* Counter - B&W Typography */}
          <div className="mb-3">
            <span className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              {count}{suffix}
            </span>
          </div>

          {/* Label */}
          <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
            {label}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
