// ============================================
// FILE: app/home/_components/sections/hero-section.tsx
// UPDATED: PHASE 4 FINAL - Opacity under 40% + overlay for text contrast
// Fixed: Lower opacity, white overlay for readable text in light mode
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Scale, ArrowRight, CheckCircle2 } from 'lucide-react'
import { heroContent } from '@/lib/data/hero-content'
import { scrollToSection } from '@/lib/utils/scroll-utils'
import Image from 'next/image'

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-slate-950"
    >
      {/* Layer 1: Subtle Grid Pattern - PALING BELAKANG */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:80px_80px]" />

      {/* Layer 2: Lady Justice Background Image - UNDER 40% OPACITY */}
      <div className="absolute inset-0 z-[1]">
        <Image
          src="https://res.cloudinary.com/dxxds8jkx/image/upload/v1760593675/Lady_Justice_o2noc0.png"
          alt="Lady Justice - Firma Hukum PERARI"
          fill
          priority
          quality={90}
          className="object-cover opacity-[0.35] dark:opacity-[0.30]"
          sizes="100vw"
        />
        {/* White overlay for text contrast - light mode only */}
        <div className="absolute inset-0 bg-white/70 dark:bg-transparent" />
      </div>

      {/* Layer 3: Content - PALING DEPAN */}
      <div className="container mx-auto px-4 relative z-10 pt-20 pb-24">
        <div className="max-w-5xl mx-auto text-center space-y-8">

          {/* Badge - Clean B&W */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge
              variant="secondary"
              className="text-sm px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
            >
              {heroContent.badge}
            </Badge>
          </motion.div>

          {/* Icon - Simple Clean Design */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="p-6 bg-slate-900 dark:bg-white rounded-2xl border-2 border-slate-900 dark:border-white">
              <Scale className="w-16 h-16 text-white dark:text-slate-900" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Title - Clean B&W Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              <span className="block mb-2">
                {heroContent.headline.line1}
              </span>
              <span className="block text-slate-900 dark:text-white">
                {heroContent.headline.line2}
              </span>
            </h1>
          </motion.div>

          {/* Subtitle - Clean Typography */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              {heroContent.subheadline}
            </p>
          </motion.div>

          {/* CTA Buttons - Simple B&W */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 group"
              onClick={() => scrollToSection(heroContent.cta.primary.href)}
            >
              {heroContent.cta.primary.text}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900"
              onClick={() => scrollToSection(heroContent.cta.secondary.href)}
            >
              {heroContent.cta.secondary.text}
            </Button>
          </motion.div>

          {/* Trust Indicators - Clean B&W */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 pt-12 text-slate-600 dark:text-slate-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            {heroContent.trustIndicators.map((indicator, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-slate-900 dark:text-white" strokeWidth={2} />
                <span className="font-medium">{indicator.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator - PASS (good position) */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <div className="w-6 h-10 border-2 border-slate-400 dark:border-slate-500 rounded-full flex justify-center p-2">
          <motion.div
            className="w-1 h-3 bg-slate-600 dark:bg-slate-400 rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>
      </motion.div>
    </section>
  )
}
