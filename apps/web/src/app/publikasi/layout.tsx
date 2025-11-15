import { PublikasiHeader } from '@/components/publikasi/layout/publikasi-header'
import { PublikasiFooter } from '@/components/publikasi/layout/publikasi-footer'

export const metadata = {
  title: 'Publikasi Hukum | FIRMA-PERARI',
  description: 'Artikel, berita, dan analisis hukum dari FIRMA-PERARI',
}

export default function PublikasiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublikasiHeader />
      <main className="flex-1">{children}</main>
      <PublikasiFooter />
    </div>
  )
}