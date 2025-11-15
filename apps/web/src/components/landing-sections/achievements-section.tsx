// ============================================
// FILE: app/home/_components/sections/achievements-section.tsx
// ============================================
'use client'

import { motion } from 'framer-motion'
import { achievementsData } from '@/lib/constant/achievements-data'
import { AchievementBadge } from '@/components/landing-cards/achievement-badge'
import { SectionHeading } from '@/components/costum-landing-ui/section-heading'

export function AchievementsSection() {
  return (
    <section id="achievements" className="py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

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
            <p className="text-lg text-muted-foreground mb-8">
              Dipercaya oleh perusahaan dan institusi terkemuka
            </p>

            {/* Client Logos Placeholder */}
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-32 h-16 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-semibold text-slate-400">Logo {i}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}