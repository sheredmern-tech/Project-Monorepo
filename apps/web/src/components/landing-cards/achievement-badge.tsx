// ============================================
// FILE: app/home/_components/cards/achievement-badge.tsx
// UPDATED: PHASE 2 - B&W Clean Design
// Removed: Colored gradients, shine effects
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Award, Star, Heart, Shield, Zap, type LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Trophy,
  Award,
  Star,
  Heart,
  Shield,
  Zap,
}

interface AchievementBadgeProps {
  title: string
  issuer: string
  year: string
  icon: string
  color: string // Keep for backwards compatibility, but won't use
  description: string
}

export function AchievementBadge({
  title,
  issuer,
  year,
  icon,
  description,
}: AchievementBadgeProps) {
  const Icon = iconMap[icon] || Trophy

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="relative overflow-hidden border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white transition-all duration-300 hover:shadow-lg bg-white dark:bg-slate-950">
        <div className="relative p-6 text-center">
          {/* Icon - Clean B&W */}
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center">
              <Icon className="w-8 h-8 text-white dark:text-slate-900" strokeWidth={2} />
            </div>
          </div>

          {/* Year Badge - B&W */}
          <Badge variant="secondary" className="mb-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
            {year}
          </Badge>

          {/* Title */}
          <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">
            {title}
          </h3>

          {/* Issuer */}
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {issuer}
          </p>

          {/* Description */}
          <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
            {description}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
