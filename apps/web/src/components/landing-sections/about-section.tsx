// ============================================
// FILE: app/home/_components/sections/about-section.tsx
// UPDATED: PHASE 2 - B&W Clean Design
// Removed: Colored icons, gradient backgrounds
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, Users, Shield, Target, Sparkles, TrendingUp, Scale } from 'lucide-react'
import { SectionHeading } from '@/components/custom-landing-ui/section-heading'

const features = [
  {
    icon: Award,
    title: 'Berpengalaman',
    description: 'Tim advokat dengan pengalaman lebih dari 15 tahun di berbagai bidang hukum',
    highlight: '15+ Tahun'
  },
  {
    icon: Shield,
    title: 'Terpercaya',
    description: 'Menangani ratusan kasus dengan tingkat kepuasan klien yang tinggi',
    highlight: '500+ Klien'
  },
  {
    icon: Users,
    title: 'Profesional',
    description: 'Pendekatan profesional dan personal untuk setiap klien',
    highlight: 'Dedikasi 100%'
  }
]

const achievements = [
  { icon: Target, label: 'Best Law Firm 2024' },
  { icon: Sparkles, label: 'Client Choice Award' },
  { icon: TrendingUp, label: 'Top Rated 5 Years' },
]

export function AboutSection() {
  return (
    <section id="tentang" className="py-24 md:py-32 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <SectionHeading
            badge="Profil Kami"
            title="Tentang Firma PERARI"
            subtitle="Firma hukum terpercaya dengan pengalaman lebih dari 15 tahun dalam menangani berbagai kasus hukum di seluruh Indonesia"
          />

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Content */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  Komitmen Kami untuk Keadilan
                </h3>
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-white">Firma Hukum PERARI</strong> adalah firma hukum yang berdedikasi untuk memberikan layanan hukum terbaik kepada klien kami. Dengan tim advokat berpengalaman dan profesional, kami siap membantu menyelesaikan berbagai permasalahan hukum Anda.
                </p>
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  Kami memahami bahwa setiap kasus memiliki keunikan tersendiri. Oleh karena itu, kami memberikan pendekatan personal dan solusi yang disesuaikan dengan kebutuhan spesifik setiap klien.
                </p>
              </div>

              {/* Achievements - B&W */}
              <div className="flex flex-wrap gap-4 pt-4">
                {achievements.map((achievement, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                    whileHover={{ scale: 1.05 }}
                  >
                    <achievement.icon className="w-5 h-5 text-slate-900 dark:text-white" strokeWidth={2} />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{achievement.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Visual - Clean B&W */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 rounded-3xl p-8 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                <Scale className="w-full h-full text-slate-300 dark:text-slate-600" strokeWidth={0.5} />
              </div>
            </motion.div>
          </div>

          {/* Features Grid - Clean B&W */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white hover:shadow-lg transition-all">
                  <div className="w-14 h-14 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-white dark:text-slate-900" strokeWidth={2} />
                  </div>
                  <Badge variant="secondary" className="mb-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                    {feature.highlight}
                  </Badge>
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
