// ============================================
// FILE: app/layanan/layout.tsx
// ============================================
import { HomeHeader } from '@/components/landing-layout/landing-home-header'
import { HomeTOC } from '@/components/landing-layout/landing-home-toc'

export default function LayananLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      <HomeHeader />
      <div className="flex">
        <main className="flex-1">{children}</main>
        <HomeTOC />
      </div>
    </div>
  )
}