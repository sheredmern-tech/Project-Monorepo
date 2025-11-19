// ============================================
// FILE: app/home/_components/cards/team-card.tsx
// UPDATED: B&W CONSISTENCY - Removed all colored gradients and elements
// ============================================
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Mail, Phone, Award, GraduationCap, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TeamCardProps {
  name: string
  role: string
  specialization: string[]
  initials: string
  gradient: string
  experience: string
  description: string
  education?: string[]
  achievements?: string[]
  email?: string
  phone?: string
}

export function TeamCard({
  name,
  role,
  specialization,
  initials,
  gradient,
  experience,
  description,
  education,
  achievements,
  email,
  phone,
}: TeamCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -4 }}
        onHoverStart={() => setIsFlipped(true)}
        onHoverEnd={() => setIsFlipped(false)}
        className="h-full"
      >
        <Card className="group relative overflow-hidden h-full border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white transition-all duration-300 hover:shadow-xl cursor-pointer bg-white dark:bg-slate-950"
          onClick={() => setIsDialogOpen(true)}
        >
          <div className="p-6 md:p-8 h-full flex flex-col">
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                // FRONT SIDE - B&W
                <motion.div
                  key="front"
                  initial={{ rotateY: 0 }}
                  exit={{ rotateY: 90 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  {/* Avatar & Badge - B&W */}
                  <div className="flex items-start justify-between mb-4">
                    <Avatar className="w-20 h-20 border-4 border-slate-900 dark:border-white shadow-lg bg-slate-900 dark:bg-white">
                      <AvatarFallback className="text-white dark:text-slate-900 text-2xl font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                      {experience}
                    </Badge>
                  </div>

                  {/* Info - B&W */}
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">
                      {name}
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-2">{role}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {description}
                    </p>
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2">
                    {specialization.map((spec, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  {/* Hover Indicator */}
                  <div className="mt-4 pt-4 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-center text-muted-foreground">
                      Click untuk detail lengkap
                    </p>
                  </div>
                </motion.div>
              ) : (
                // BACK SIDE - B&W
                <motion.div
                  key="back"
                  initial={{ rotateY: -90 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full"
                >
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                    <Briefcase className="w-4 h-4 text-slate-900 dark:text-white" strokeWidth={2} />
                    Keahlian
                  </h4>
                  <div className="space-y-2 flex-grow">
                    {specialization.map((spec, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-slate-900 dark:bg-white rounded-full mt-1.5" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{spec}</span>
                      </div>
                    ))}
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex gap-2 pt-4 border-t">
                    {email && (
                      <Button size="sm" variant="outline" className="flex-1" asChild>
                        <a href={`mailto:${email}`}>
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </a>
                      </Button>
                    )}
                    {phone && (
                      <Button size="sm" variant="outline" className="flex-1" asChild>
                        <a href={`tel:${phone}`}>
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </a>
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>

      {/* Detail Dialog - B&W */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <Avatar className="w-16 h-16 bg-slate-900 dark:bg-white">
                <AvatarFallback className="text-white dark:text-slate-900 text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{name}</DialogTitle>
                <DialogDescription className="text-base">{role}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Description */}
            <div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
            </div>

            {/* Specialization - B&W */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                <Briefcase className="w-4 h-4 text-slate-900 dark:text-white" strokeWidth={2} />
                Spesialisasi
              </h4>
              <div className="flex flex-wrap gap-2">
                {specialization.map((spec, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Education - B&W */}
            {education && education.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                  <GraduationCap className="w-4 h-4 text-slate-900 dark:text-white" strokeWidth={2} />
                  Pendidikan
                </h4>
                <ul className="space-y-2">
                  {education.map((edu, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-slate-900 dark:bg-white rounded-full mt-2" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Achievements - B&W */}
            {achievements && achievements.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                  <Award className="w-4 h-4 text-slate-900 dark:text-white" strokeWidth={2} />
                  Penghargaan
                </h4>
                <ul className="space-y-2">
                  {achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-slate-900 dark:bg-white rounded-full mt-2" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact */}
            <div className="pt-4 border-t">
              <div className="flex gap-3">
                {email && (
                  <Button variant="default" className="flex-1" asChild>
                    <a href={`mailto:${email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </a>
                  </Button>
                )}
                {phone && (
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`tel:${phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}