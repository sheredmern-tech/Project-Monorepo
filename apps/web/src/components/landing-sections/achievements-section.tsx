// ============================================
// FILE: app/home/_components/sections/achievements-section.tsx
// UPDATED: PHASE 2 - B&W Clean Design
// Removed: Colored gradient orbs
// ============================================
'use client'

import { motion } from 'framer-motion'
import { achievementsData } from '@/lib/data/achievements-data'
import { AchievementBadge } from '@/components/landing-cards/achievement-badge'
import { SectionHeading } from '@/components/custom-landing-ui/section-heading'

export function AchievementsSection() {
  return (
    <section id="achievements" className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Subtle Grid Pattern - B&W */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <SectionHeading
            badge="Penghargaan & Sertifikasi"
            title="Prestasi Kami"
            subtitle="Diakui dan dipercaya oleh berbagai institusi nasional dan internasional"
          />

          {/* Achievements Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievementsData.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <AchievementBadge {...achievement} />
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 text-center"
          >
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Dipercaya oleh perusahaan dan institusi terkemuka
            </p>

            {/* Client Logos Placeholder - B&W */}
            <div className="flex flex-wrap justify-center items-center gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-32 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-300 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Logo {i}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
