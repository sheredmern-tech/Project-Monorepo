// ============================================
// FILE: app/home/_components/layout/home-footer.tsx
// ============================================
'use client'

import Link from 'next/link'
import { Scale, Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WaveDivider } from '@/components/costum-landing-ui/wave-divider'
import { siteConfig } from '@/lib/constant/site-config'
import { scrollToSection } from '@/lib/utils/scroll-utils'

const quickLinks = [
  { label: 'Beranda', href: '#hero' },
  { label: 'Tentang Kami', href: '#tentang' },
  { label: 'Layanan', href: '#layanan' },
  { label: 'Tim', href: '#tim' },
  { label: 'Kontak', href: '#kontak' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Cookie Policy', href: '#' },
  { label: 'Disclaimer', href: '#' },
]

const socialLinks = [
  { icon: Facebook, href: siteConfig.social.facebook, label: 'Facebook' },
  { icon: Instagram, href: siteConfig.social.instagram, label: 'Instagram' },
  { icon: Linkedin, href: siteConfig.social.linkedin, label: 'LinkedIn' },
  { icon: Twitter, href: siteConfig.social.twitter, label: 'Twitter' },
]

export function HomeFooter() {
  const handleQuickLinkClick = (href: string) => {
    if (href.startsWith('#')) {
      scrollToSection(href)
    }
  }

  return (
    <footer className="relative bg-slate-900 text-white">
      {/* Wave Divider */}
      <WaveDivider
        variant="flipped"
        color="fill-white dark:fill-slate-900"
        className="-mt-1"
      />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold">Firma Hukum PERARI</span>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                {siteConfig.description}
              </p>

              {/* Contact Info */}
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>{siteConfig.contact.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{siteConfig.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>{siteConfig.contact.email}</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary transition-colors flex items-center justify-center group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Tautan Cepat</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (link.href.startsWith('#')) {
                          e.preventDefault()
                          handleQuickLinkClick(link.href)
                        }
                      }}
                      className="text-slate-400 hover:text-primary transition-colors inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Legal</h4>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-slate-400 hover:text-primary transition-colors inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="mb-12 p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="max-w-2xl mx-auto text-center">
              <h4 className="font-semibold mb-2 text-lg">Newsletter</h4>
              <p className="text-slate-400 mb-4 text-sm">
                Dapatkan update terbaru tentang hukum dan layanan kami
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Email Anda"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
                <Button variant="default">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-800 mb-8" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span>Made with</span>
              <span className="text-red-500">❤️</span>
              <span>in Indonesia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}