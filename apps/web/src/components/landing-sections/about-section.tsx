// ============================================
// FILE: app/home/_components/sections/about-section.tsx
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, Users, Shield, Target, Sparkles, TrendingUp, Scale } from 'lucide-react'
import { SectionHeading } from '@/app/home/_components/costum-landing-ui/section-heading'

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
  { icon: Target, label: 'Best Law Firm 2024', color: 'text-yellow-500' },
  { icon: Sparkles, label: 'Client Choice Award', color: 'text-blue-500' },
  { icon: TrendingUp, label: 'Top Rated 5 Years', color: 'text-green-500' },
]

export function AboutSection() {
  return (
    <section id="tentang" className="py-24 md:py-32 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
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
                <h3 className="text-2xl md:text-3xl font-bold">Komitmen Kami untuk Keadilan</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  <strong className="text-primary">Firma Hukum PERARI</strong> adalah firma hukum yang berdedikasi untuk memberikan layanan hukum terbaik kepada klien kami. Dengan tim advokat berpengalaman dan profesional, kami siap membantu menyelesaikan berbagai permasalahan hukum Anda.
                </p>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Kami memahami bahwa setiap kasus memiliki keunikan tersendiri. Oleh karena itu, kami memberikan pendekatan personal dan solusi yang disesuaikan dengan kebutuhan spesifik setiap klien.
                </p>
              </div>

              {/* Achievements */}
              <div className="flex flex-wrap gap-4 pt-4">
                {achievements.map((achievement, idx) => (
                  <motion.div 
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border shadow-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
                    <span className="text-sm font-medium">{achievement.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl blur-2xl" />
              <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8 flex items-center justify-center border border-primary/10">
                <Scale className="w-full h-full text-primary/20" />
              </div>
            </motion.div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-xl transition-all hover:-translate-y-1 border-2 hover:border-primary/20 group h-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <Badge variant="secondary" className="mb-3">{feature.highlight}</Badge>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
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