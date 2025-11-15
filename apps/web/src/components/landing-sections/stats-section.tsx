// ============================================
// FILE: app/home/_components/sections/stats-section.tsx
// ============================================
'use client'

import { motion } from 'framer-motion'
import { statsData } from '@/lib/constant/stats-data'
import { StatCard } from '@/components/landing-cards/stat-card'
import * as LucideIcons from 'lucide-react'

export function StatsSection() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

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