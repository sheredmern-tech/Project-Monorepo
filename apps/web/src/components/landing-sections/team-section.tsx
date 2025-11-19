// ============================================
// FILE: app/home/_components/sections/team-section.tsx
// UPDATED: B&W CONSISTENCY - Removed gradient backgrounds and colors
// ============================================
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight } from 'lucide-react'
import { teamData, teamCategories } from '@/lib/data/team-data'
import { TeamCard } from '@/components/landing-cards/team-card'
import { SectionHeading } from '@/components/custom-landing-ui/section-heading'

export function TeamSection() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredTeam = activeCategory === 'all'
    ? teamData
    : teamData.filter(t => t.category === activeCategory)

  return (
    <section id="tim" className="py-24 md:py-32 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <SectionHeading
            badge="Tim Profesional"
            title="Tim Advokat Kami"
            subtitle="Didukung oleh advokat berpengalaman dan profesional di bidangnya dengan total pengalaman 80+ tahun"
          />

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid w-full max-w-xl mx-auto grid-cols-4">
                {teamCategories.map((cat) => (
                  <TabsTrigger
                    key={cat.value}
                    value={cat.value}
                    className="text-xs sm:text-sm"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Team Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredTeam.map((member, index) => (
              <TeamCard key={member.name} {...member} />
            ))}
          </div>

          {/* Join Team CTA - B&W */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white transition-all">
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Bergabung dengan Tim Kami</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Kami selalu mencari talenta terbaik untuk bergabung dengan tim profesional kami
              </p>
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900">
                Lihat Lowongan Kerja
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}