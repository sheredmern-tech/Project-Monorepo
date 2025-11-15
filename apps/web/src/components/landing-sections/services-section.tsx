// ============================================
// FILE: app/home/_components/sections/services-section.tsx
// ============================================
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight } from 'lucide-react'
import { servicesData, serviceCategories } from '@/lib/constant/services-data'
import { ServiceCard } from '@/components/landing-cards/service-card'
import { CTACard } from '@/components/landing-cards/cta-card'
import { SectionHeading } from '@/components/costum-landing-ui/section-heading'
import { scrollToSection } from '@/lib/utils/scroll-utils'

export function ServicesSection() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredServices = activeCategory === 'all'
    ? servicesData
    : servicesData.filter(s => s.category === activeCategory)

  return (
    <section id="layanan" className="py-24 md:py-32 bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-950/30 dark:to-slate-900">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <SectionHeading
            badge="Layanan Kami"
            title="Bagaimana Kami Bisa Bantu?"
            subtitle="Kami menyediakan berbagai layanan hukum dengan pendekatan yang empatik dan profesional untuk memenuhi kebutuhan Anda"
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
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-auto p-1.5 bg-slate-100/80 dark:bg-slate-800/80">
                {serviceCategories.map((cat) => (
                  <TabsTrigger
                    key={cat.value}
                    value={cat.value}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"
                  >
                    <span className="text-xs sm:text-sm font-medium">{cat.label}</span>
                    <Badge
                      variant={activeCategory === cat.value ? "default" : "secondary"}
                      className="text-xs px-2"
                    >
                      {cat.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredServices.map((service, index) => (
              <ServiceCard key={service.slug} {...service} />
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/layanan">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 group"
              >
                Lihat Semua Layanan
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* CTA Section */}
          <CTACard
            title="Butuh Konsultasi Hukum?"
            description="Dapatkan konsultasi gratis dari tim advokat profesional kami. Kami siap membantu menyelesaikan permasalahan hukum Anda dengan pendekatan yang ramah dan mudah dipahami."
            primaryLabel="Konsultasi Gratis"
            primaryAction={() => scrollToSection('#kontak')}
            secondaryLabel="Hubungi WhatsApp"
            secondaryAction={() => window.open('https://wa.me/6281234567890', '_blank')}
          />
        </div>
      </div>
    </section>
  )
}
