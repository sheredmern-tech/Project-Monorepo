// ============================================================================
// FILE 5: app/page.tsx - LANDING PAGE
// ============================================================================
'use client'

import { HomeHeader } from '../components/layouts/landing-home-header'
import { HomeFooter } from '../components/layouts/landing-home-footer'
import { HomeTOC } from '../components/layouts/landing-home-toc'
import { HeroSection } from '../components/landing-sections/hero-section'
import { StatsSection } from '../components/landing-sections/stats-section'
import { AboutSection } from '../components/landing-sections/about-section'
import { VisionMissionSection } from '../components/landing-sections/vision-mission-section'
import { ServicesSection } from '../components/landing-sections/services-section'
import { TeamSection } from '../components/landing-sections/team-section'
import { TestimonialsSection } from '../components/landing-sections/testimonials-section'
import { AchievementsSection } from '../components/landing-sections/achievements-section'
import { CTASection } from '../components/landing-sections/cta-section'
import { ContactSection } from '../components/landing-sections/contact-section'
import { FloatingWhatsApp } from '../components/custom-landing-ui/floating-whatsapp'
import { ScrollProgress } from '../components/custom-landing-ui/scroll-progress'
import { BackToTop } from '../components/custom-landing-ui/back-to-top'

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <HomeHeader />
      <ScrollProgress />

      <main className="relative">
        <HeroSection />
        <StatsSection />
        <AboutSection />
        <VisionMissionSection />
        <ServicesSection />
        <TeamSection />
        <TestimonialsSection />
        <AchievementsSection />
        <CTASection />
        <ContactSection />
      </main>

      <HomeFooter />

      <HomeTOC />
      <FloatingWhatsApp />
      <BackToTop />
    </div>
  )
}