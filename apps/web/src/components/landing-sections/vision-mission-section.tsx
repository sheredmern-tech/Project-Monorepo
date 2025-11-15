// ============================================
// FILE: app/home/_components/sections/vision-mission-section.tsx
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, Compass, Lightbulb, Heart, Users2, Trophy } from 'lucide-react'
import { SectionHeading } from '@/app/home/_components/costum-landing-ui/section-heading'

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
    <section id="visi-misi" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
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
            {/* VISI */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 h-full">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative p-8 md:p-10">
                  {/* Icon Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
                      <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-2 group-hover:text-primary transition-colors">Visi</h3>
                      <p className="text-sm text-muted-foreground">Tujuan jangka panjang kami</p>
                    </div>
                  </div>

                  {/* Visi Content */}
                  <div className="space-y-4">
                    {visiItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-lg hover:bg-primary/5 transition-colors group/item">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover/item:bg-primary/20 transition-colors">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-base leading-relaxed pt-1.5">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* MISI */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 h-full">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-blue-500/10 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative p-8 md:p-10">
                  {/* Icon Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl" />
                      <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Compass className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-2 group-hover:text-blue-600 transition-colors">Misi</h3>
                      <p className="text-sm text-muted-foreground">Langkah strategis kami</p>
                    </div>
                  </div>

                  {/* Misi Content */}
                  <ul className="space-y-4">
                    {misiItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 group/item">
                        <div className="flex items-center justify-center w-7 h-7 bg-blue-500/10 rounded-full flex-shrink-0 mt-0.5 group-hover/item:bg-blue-500/20 transition-colors">
                          <span className="text-sm font-bold text-blue-600">{idx + 1}</span>
                        </div>
                        <p className="text-base leading-relaxed pt-0.5">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Values Section */}
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
                className="text-center p-6 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors"
                whileHover={{ y: -4 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">{value.title}</h4>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
