// ============================================
// FILE: app/home/_components/sections/vision-mission-section.tsx
// UPDATED: B&W CONSISTENCY - Removed all primary/blue gradients and colors
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, Compass, Lightbulb, Heart, Users2, Trophy } from 'lucide-react'
import { SectionHeading } from '@/components/custom-landing-ui/section-heading'

const visiItems = [
  { icon: Lightbulb, text: 'Menjadi firma hukum terdepan yang dikenal karena integritas dan profesionalisme' },
  { icon: Trophy, text: 'Komitmen terhadap keadilan dan perlindungan hak klien' },
  { icon: Heart, text: 'Memberikan solusi hukum inovatif yang melindungi kepentingan klien' },
]

const misiItems = [
  'Memberikan layanan hukum berkualitas tinggi dengan pendekatan personal',
  'Menjaga kepercayaan klien melalui transparansi dan komunikasi efektif',
  'Terus berinovasi dalam memberikan solusi hukum terbaik',
  'Membangun hubungan jangka panjang dengan klien berbasis kepercayaan',
  'Berkontribusi positif untuk penegakan hukum di Indonesia',
]

export function VisionMissionSection() {
  return (
    <section id="visi-misi" className="py-24 md:py-32 relative overflow-hidden bg-white dark:bg-slate-950">
      {/* Background Pattern - B&W Only */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <SectionHeading
            badge="Komitmen Kami"
            title="Visi & Misi"
            subtitle="Dedikasi kami untuk memberikan pelayanan hukum terbaik"
          />

          <div className="grid lg:grid-cols-2 gap-8">
            {/* VISI - B&W Clean Design */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white bg-white dark:bg-slate-950">
                <div className="relative p-8 md:p-10">
                  {/* Icon Header - B&W */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center">
                      <Target className="w-8 h-8 text-white dark:text-slate-900" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Visi</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Tujuan jangka panjang kami</p>
                    </div>
                  </div>

                  {/* Visi Content - B&W */}
                  <div className="space-y-4">
                    {visiItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group/item">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover/item:bg-slate-200 dark:group-hover/item:bg-slate-700 transition-colors">
                          <item.icon className="w-5 h-5 text-slate-900 dark:text-white" strokeWidth={2} />
                        </div>
                        <p className="text-base leading-relaxed pt-1.5 text-slate-700 dark:text-slate-300">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* MISI - B&W Clean Design */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white bg-white dark:bg-slate-950">
                <div className="relative p-8 md:p-10">
                  {/* Icon Header - B&W */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center">
                      <Compass className="w-8 h-8 text-white dark:text-slate-900" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Misi</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Langkah strategis kami</p>
                    </div>
                  </div>

                  {/* Misi Content - B&W */}
                  <ul className="space-y-4">
                    {misiItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 group/item">
                        <div className="flex items-center justify-center w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-full flex-shrink-0 mt-0.5 group-hover/item:bg-slate-200 dark:group-hover/item:bg-slate-700 transition-colors">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{idx + 1}</span>
                        </div>
                        <p className="text-base leading-relaxed pt-0.5 text-slate-700 dark:text-slate-300">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Values Section - B&W */}
          <motion.div
            className="mt-12 grid md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {[
              { icon: Users2, title: 'Kolaboratif', desc: 'Kerja sama tim yang solid' },
              { icon: Heart, title: 'Empati', desc: 'Memahami kebutuhan klien' },
              { icon: Trophy, title: 'Excellence', desc: 'Standar kualitas tinggi' },
            ].map((value, idx) => (
              <motion.div
                key={idx}
                className="text-center p-6 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                whileHover={{ y: -4 }}
              >
                <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-white dark:text-slate-900" strokeWidth={2} />
                </div>
                <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">{value.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
