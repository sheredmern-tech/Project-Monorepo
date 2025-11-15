// ============================================
// FILE: app/home/_components/cards/cta-card.tsx
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface CTACardProps {
  title: string
  description: string
  primaryLabel: string
  primaryAction: () => void
  secondaryLabel?: string
  secondaryAction?: () => void
}

export function CTACard({
  title,
  description,
  primaryLabel,
  primaryAction,
  secondaryLabel,
  secondaryAction,
}: CTACardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 border-0 shadow-2xl">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative p-12 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {title}
          </h3>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 shadow-lg"
              onClick={primaryAction}
            >
              {primaryLabel}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            {secondaryLabel && secondaryAction && (
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 bg-white/10 text-white border-white/30 hover:bg-white hover:text-primary transition-all"
                onClick={secondaryAction}
              >
                {secondaryLabel}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}