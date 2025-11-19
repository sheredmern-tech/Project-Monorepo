// ============================================
// FILE: app/home/_components/cards/service-card.tsx
// UPDATED: B&W CONSISTENCY - Removed gradients, glow, colors
// Standardized to match StatCard B&W design
// ============================================
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ArrowRight, type LucideIcon } from 'lucide-react'

interface ServiceCardProps {
  slug: string
  icon: LucideIcon
  title: string
  tagline: string
  description: string
  features: string[]
  gradient: string // Ignored - pure B&W now
  bgGradient: string // Ignored - pure B&W now
  glowColor: string // Ignored - pure B&W now
  category: string
  price?: string
}

export function ServiceCard({
  slug,
  icon: Icon,
  title,
  tagline,
  description,
  features,
  price,
}: ServiceCardProps) {
  return (
    <Link href={`/layanan/${slug}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -4 }}
        className="h-full"
      >
        {/* CONSISTENT B&W CARD - Same as StatCard */}
        <Card className="group relative overflow-hidden h-full border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white transition-all duration-300 hover:shadow-lg bg-white dark:bg-slate-950">
          <div className="relative p-6 md:p-8 flex flex-col h-full">
            {/* Icon - B&W CONSISTENT */}
            <div className="mb-6">
              <div className="w-14 h-14 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center">
                <Icon className="w-7 h-7 text-white dark:text-slate-900" strokeWidth={2} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow">
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                {title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-3">
                {tagline}
              </p>

              <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed text-sm">
                {description}
              </p>

              {/* Features List - B&W */}
              <div className="space-y-2 mb-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-white flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="leading-relaxed text-slate-600 dark:text-slate-400">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Price - B&W */}
              {price && (
                <Badge variant="secondary" className="mb-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                  {price}
                </Badge>
              )}
            </div>

            {/* CTA - B&W, Always visible */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-900 dark:text-white text-sm font-medium">
                  Pelajari lebih lanjut
                </span>
                <ArrowRight className="w-4 h-4 text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform" strokeWidth={2} />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}
