// ============================================
// FILE: app/home/_components/cards/testimonial-card.tsx
// UPDATED: B&W CONSISTENCY - Removed colored gradients and elements
// ============================================
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star, Quote, CheckCircle } from 'lucide-react'

interface TestimonialCardProps {
  name: string
  role: string
  company: string
  avatar: string
  rating: number
  text: string
  service: string
  verified?: boolean
}

export function TestimonialCard({
  name,
  role,
  company,
  avatar,
  rating,
  text,
  service,
  verified = false,
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="relative overflow-hidden h-full border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white transition-all duration-300 hover:shadow-xl bg-white dark:bg-slate-950">
        {/* Quote Icon Background - B&W */}
        <div className="absolute top-4 right-4 opacity-5">
          <Quote className="w-20 h-20 text-slate-900 dark:text-white" />
        </div>

        <div className="relative p-6 md:p-8 flex flex-col h-full">
          {/* Header - B&W */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 bg-slate-900 dark:bg-white border-2 border-slate-900 dark:border-white">
                <AvatarFallback className="text-white dark:text-slate-900 font-semibold">
                  {avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{name}</h4>
                  {verified && (
                    <CheckCircle className="w-4 h-4 text-slate-900 dark:text-white" strokeWidth={2} />
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{role}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{company}</p>
              </div>
            </div>
          </div>

          {/* Rating - B&W Stars */}
          <div className="flex gap-1 mb-4">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-slate-900 dark:fill-white text-slate-900 dark:text-white" strokeWidth={2} />
            ))}
          </div>

          {/* Testimonial Text */}
          <blockquote className="flex-grow mb-4">
            <p className="text-muted-foreground leading-relaxed italic">
              "{text}"
            </p>
          </blockquote>

          {/* Service Badge */}
          <div className="pt-4 border-t">
            <Badge variant="secondary" className="text-xs">
              {service}
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}