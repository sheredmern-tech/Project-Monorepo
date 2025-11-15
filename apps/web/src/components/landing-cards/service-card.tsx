// ============================================
// FILE: app/home/_components/cards/service-card.tsx
// ============================================
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
  slug: string
  icon: LucideIcon
  title: string
  tagline: string
  description: string
  features: string[]
  gradient: string
  bgGradient: string
  glowColor: string
  category: string
  price?: string
}

export function ServiceCard({
  slug,
  icon: Icon,
  title,
  tagline,
  description,
  features,
  gradient,
  bgGradient,
  glowColor,
  price,
}: ServiceCardProps) {
  return (
    <Link href={`/layanan/${slug}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -8 }}
        className="h-full"
      >
        <Card className="group relative overflow-hidden h-full border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl">
          {/* Gradient Background on Hover */}
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300",
              bgGradient
            )} 
          />
          
          {/* Glow Effect */}
          <div 
            className="absolute -inset-1 opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-300"
            style={{ background: glowColor }}
          />

          <div className="relative p-6 md:p-8 flex flex-col h-full">
            {/* Icon */}
            <div className="relative mb-6">
              <div 
                className={cn(
                  "absolute inset-0 rounded-2xl blur-xl opacity-50 group-hover:blur-2xl transition-all",
                  bgGradient
                )}
              />
              <div 
                className={cn(
                  "relative w-16 h-16 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300",
                  gradient
                )}
              >
                <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow">
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              
              <p className="text-sm text-muted-foreground/80 italic mb-3">
                {tagline}
              </p>
              
              <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                {description}
              </p>

              {/* Features List */}
              <div className="space-y-2 mb-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              {price && (
                <Badge variant="secondary" className="mb-4">
                  {price}
                </Badge>
              )}
            </div>

            {/* CTA - Always at bottom */}
            <div className="pt-4 border-t opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center justify-between">
                <span className="text-primary text-sm font-medium">
                  Pelajari lebih lanjut
                </span>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}