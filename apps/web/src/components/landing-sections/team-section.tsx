// ============================================
// FILE: app/home/_components/sections/team-section.tsx
// ============================================
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight } from 'lucide-react'
import { teamData, teamCategories } from '@/lib/constant/team-data'
import { TeamCard } from '@/components/landing-cards/team-card'
import { SectionHeading } from '@/components/costum-landing-ui/section-heading'

export function TeamSection() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredTeam = activeCategory === 'all'
    ? teamData
    : teamData.filter(t => t.category === activeCategory)

  return (
    <section id="tim" className="py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
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

          {/* Join Team CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-primary/5 to-transparent border-2 border-primary/10">
              <h3 className="text-2xl font-bold mb-4">Bergabung dengan Tim Kami</h3>
              <p className="text-muted-foreground mb-6">
                Kami selalu mencari talenta terbaik untuk bergabung dengan tim profesional kami
              </p>
              <Button size="lg">
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