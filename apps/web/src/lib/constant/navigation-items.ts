// ============================================
// FILE: app/home/_constants/navigation-items.ts
// ============================================

import { Home, Info, Target, Briefcase, Users, Mail } from 'lucide-react'

export const navigationItems = [
  { id: 'hero', title: 'Beranda', icon: Home, href: '#hero' },
  { id: 'stats', title: 'Statistik', icon: Target, href: '#stats' },
  { id: 'tentang', title: 'Tentang', icon: Info, href: '#tentang' },
  { id: 'visi-misi', title: 'Visi & Misi', icon: Target, href: '#visi-misi' },
  { id: 'layanan', title: 'Layanan', icon: Briefcase, href: '#layanan' },
  { id: 'tim', title: 'Tim', icon: Users, href: '#tim' },
  { id: 'testimonials', title: 'Testimoni', icon: Users, href: '#testimonials' },
  { id: 'achievements', title: 'Penghargaan', icon: Target, href: '#achievements' },
  { id: 'kontak', title: 'Kontak', icon: Mail, href: '#kontak' },
]

export const mobileNavItems = [
  { title: 'Beranda', href: '#hero' },
  { title: 'Tentang', href: '#tentang' },
  { title: 'Visi & Misi', href: '#visi-misi' },
  { title: 'Layanan', href: '#layanan' },
  { title: 'Tim', href: '#tim' },
  { title: 'Testimoni', href: '#testimonials' },
  { title: 'Kontak', href: '#kontak' },
]