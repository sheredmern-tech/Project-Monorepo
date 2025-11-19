// ============================================
// FILE: app/home/_components/sections/contact-section.tsx
// UPDATED: B&W CONSISTENCY - Converted primary-colored icon boxes to B&W
// ============================================
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { siteConfig } from '@/lib/data/site-config'
import { SectionHeading } from '@/components/custom-landing-ui/section-heading'

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('Form submitted:', formData)
    alert('Terima kasih! Kami akan segera menghubungi Anda.')

    setFormData({ name: '', email: '', phone: '', message: '' })
    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }))
  }

  return (
    <section id="kontak" className="py-24 md:py-32 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <SectionHeading
            badge="Hubungi Kami"
            title="Dapatkan Konsultasi Gratis"
            subtitle="Tim kami siap membantu Anda menyelesaikan permasalahan hukum dengan solusi yang tepat"
          />

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-semibold mb-6">Informasi Kontak</h3>

              <Card className="p-6 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white dark:text-slate-900" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Alamat</h4>
                    <p className="text-muted-foreground">
                      {siteConfig.contact.address}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white dark:text-slate-900" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Telepon</h4>
                    <p className="text-muted-foreground">
                      {siteConfig.contact.phone}<br />
                      {siteConfig.contact.whatsapp} (WhatsApp)
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white dark:text-slate-900" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-muted-foreground">
                      {siteConfig.contact.email}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white dark:text-slate-900" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Jam Operasional</h4>
                    <p className="text-muted-foreground">
                      {siteConfig.businessHours.weekdays}<br />
                      {siteConfig.businessHours.saturday}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Map Placeholder */}
              <Card className="p-4 bg-slate-100 dark:bg-slate-800 h-64 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Google Maps Integration</p>
                  <p className="text-xs">Embed your location here</p>
                </div>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-semibold mb-6">Kirim Pesan</h3>
              <Card className="p-6 md:p-8 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-white transition-all">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      placeholder="Masukkan nama lengkap"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon *</Label>
                    <Input
                      id="phone"
                      placeholder="+62 812 3456 7890"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Pesan *</Label>
                    <Textarea
                      id="message"
                      placeholder="Ceritakan permasalahan hukum Anda..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Mengirim...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Dengan mengirim pesan, Anda menyetujui kebijakan privasi kami
                  </p>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}