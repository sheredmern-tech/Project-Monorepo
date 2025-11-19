// ============================================
// FILE: app/home/_components/sections/cta-section.tsx
// UPDATED: B&W CONSISTENCY - Converted from colored gradient to B&W design
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Phone, Mail, MessageCircle } from 'lucide-react'
import { scrollToSection } from '@/lib/utils/scroll-utils'
import { siteConfig } from '@/lib/data/site-config'

export function CTASection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-slate-900 dark:bg-white">
      {/* Background Pattern - B&W */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white dark:text-slate-900 mb-6">
              Siap Untuk Konsultasi?
            </h2>
            <p className="text-xl text-white/90 dark:text-slate-600 mb-12 leading-relaxed">
              Jangan biarkan masalah hukum mengganggu kehidupan Anda. Hubungi kami sekarang untuk konsultasi gratis dan dapatkan solusi terbaik.
            </p>

            {/* CTA Buttons - B&W */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-white shadow-xl"
                onClick={() => scrollToSection('#kontak')}
              >
                Konsultasi Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-transparent border-2 border-white dark:border-slate-900 text-white dark:text-slate-900 hover:bg-white hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white transition-all"
                onClick={() => window.open(`https://wa.me/${siteConfig.contact.whatsapp.replace(/\D/g, '')}`, '_blank')}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </Button>
            </div>

            {/* Contact Methods - B&W */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center text-white/80 dark:text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>{siteConfig.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>{siteConfig.contact.email}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}