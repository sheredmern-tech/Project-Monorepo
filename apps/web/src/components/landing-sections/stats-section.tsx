// ============================================
// FILE: app/home/_components/sections/stats-section.tsx
// UPDATED: PHASE 2 - B&W Clean Design
// Removed: Gradient orbs, colored decorations
// ============================================
'use client'

import { motion } from 'framer-motion'
import { statsData } from '@/lib/data/stats-data'
import { StatCard } from '@/components/landing-cards/stat-card'
import * as LucideIcons from 'lucide-react'

export function StatsSection() {
  return (
    <section id="stats" className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Subtle Grid Pattern - B&W */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Grid of Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => {
              const Icon = LucideIcons[stat.icon as keyof typeof LucideIcons] as any

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <StatCard
                    icon={Icon}
                    value={stat.value}
                    suffix={stat.suffix}
                    label={stat.label}
                    description={stat.description}
                    color={stat.color}
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
