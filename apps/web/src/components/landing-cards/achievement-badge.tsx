// ============================================
// FILE: app/home/_components/cards/achievement-badge.tsx
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Award, Star, Heart, Shield, Zap, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  color: string
  description: string
}

export function AchievementBadge({
  title,
  issuer,
  year,
  icon,
  color,
  description,
}: AchievementBadgeProps) {
  const Icon = iconMap[icon] || Trophy

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05, rotate: 2 }}
    >
      <Card className="relative overflow-hidden border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group">
        {/* Gradient Background */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity", color)} />
        
        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />

        <div className="relative p-6 text-center">
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className={cn("w-16 h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", color)}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Year Badge */}
          <Badge variant="secondary" className="mb-3">
            {year}
          </Badge>

          {/* Title */}
          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Issuer */}
          <p className="text-sm text-muted-foreground mb-2">
            {issuer}
          </p>

          {/* Description */}
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            {description}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}