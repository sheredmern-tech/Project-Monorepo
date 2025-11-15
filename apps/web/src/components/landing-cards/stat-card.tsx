// ============================================
// FILE: app/home/_components/cards/stat-card.tsx
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { type LucideIcon } from 'lucide-react'
import { useCounterAnimation } from '@/lib/hooks/_hooks/use-counter-animation'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  value: number
  suffix?: string
  label: string
  description: string
  color: string
}

export function StatCard({
  icon: Icon,
  value,
  suffix = '',
  label,
  description,
  color,
}: StatCardProps) {
  const { count, elementRef } = useCounterAnimation(value, 2000)

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      <Card className="relative overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-xl">
        {/* Gradient Background */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", color)} />
        
        {/* Icon Background Glow */}
        <div className="absolute top-4 right-4 opacity-10">
          <Icon className="w-24 h-24" />
        </div>

        <div className="relative p-6 md:p-8">
          {/* Icon */}
          <div className="mb-4">
            <div className={cn("w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg", color)}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Counter */}
          <div className="mb-2">
            <span className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              {count}{suffix}
            </span>
          </div>

          {/* Label */}
          <h3 className="text-lg font-semibold mb-2">{label}</h3>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}