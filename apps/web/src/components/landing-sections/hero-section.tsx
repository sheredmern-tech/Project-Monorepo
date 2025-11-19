// ============================================
// FILE: app/home/_components/sections/hero-section.tsx
// UPDATED: PHASE 2 - B&W Clean Minimalist Design
// Removed: Particles, gradient blobs, complex decorations
// Focus: Clean, professional, readable
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Scale, ArrowRight, CheckCircle2 } from 'lucide-react'
import { heroContent } from '@/lib/data/hero-content'
import { scrollToSection } from '@/lib/utils/scroll-utils'

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-slate-950"
    >
      {/* Simple Clean Background - No Images, No Particles */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

      {/* Subtle Grid Pattern - B&W Only */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:80px_80px]" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
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
              <span className="block text-slate-700 dark:text-slate-300">
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

      {/* Scroll Indicator - B&W Clean */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <div className="w-6 h-10 border-2 border-slate-300 dark:border-slate-600 rounded-full flex justify-center p-2">
          <motion.div
            className="w-1 h-3 bg-slate-400 dark:bg-slate-500 rounded-full"
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
