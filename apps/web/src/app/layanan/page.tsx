
// ============================================
// FILE: app/layanan/page.tsx
// ============================================
'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import Link from 'next/link'
import { 
  Heart,
  Briefcase, 
  Users, 
  FileText, 
  ShieldCheck, 
  Home as HomeIcon,
  ArrowRight,
  CheckCircle2,
  Search,
  Filter
} from 'lucide-react'

const layananList = [
  {
    slug: 'hukum-keluarga',
    icon: Heart,
    title: 'Hukum Keluarga',
    tagline: 'Karena setiap keluarga punya cerita unik',
    description: 'Kami memahami setiap keluarga punya cerita unik. Dengan pendekatan yang empatik dan profesional, kami siap membantu menyelesaikan permasalahan keluarga Anda.',
    features: [
      'Mediasi keluarga dan penyelesaian damai',
      'Konsultasi hak asuh anak',
      'Pembuatan perjanjian pranikah',
      'Konsultasi warisan dan hibah',
      'Pembuatan surat wasiat',
      'Adopsi dan perwalian anak'
    ],
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-500/10',
    hoverColor: 'hover:border-pink-500/50',
    category: 'personal'
  },
  {
    slug: 'konsultasi-bisnis-umkm',
    icon: Briefcase,
    title: 'Konsultasi Bisnis & UMKM',
    tagline: 'Wujudkan bisnis impian Anda dengan aman',
    description: 'Mulai atau kembangkan bisnis Anda dengan aman. Kami hadir untuk mendampingi pengusaha pemula hingga UMKM dengan solusi hukum yang mudah dipahami.',
    features: [
      'Pendirian PT, CV, dan badan usaha',
      'Pembuatan kontrak bisnis sederhana',
      'Pendaftaran merek dan hak cipta',
      'Review perjanjian kerjasama',
      'Konsultasi perizinan usaha'
    ],
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500/10',
    hoverColor: 'hover:border-blue-500/50',
    category: 'bisnis'
  },
  {
    slug: 'hukum-ketenagakerjaan',
    icon: Users,
    title: 'Hukum Ketenagakerjaan',
    tagline: 'Hubungan kerja yang adil untuk semua',
    description: 'Baik Anda karyawan atau pengusaha, kami bantu pastikan hubungan kerja berjalan adil dan sesuai aturan.',
    features: [
      'Konsultasi pemutusan hubungan kerja',
      'Pembuatan kontrak kerja',
      'Konsultasi hak dan kompensasi karyawan',
      'Mediasi masalah tempat kerja',
      'Review peraturan perusahaan'
    ],
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-500/10',
    hoverColor: 'hover:border-orange-500/50',
    category: 'bisnis'
  },
  {
    slug: 'perlindungan-konsumen',
    icon: ShieldCheck,
    title: 'Perlindungan Konsumen',
    tagline: 'Hak Anda sebagai konsumen adalah prioritas kami',
    description: 'Merasa dirugikan sebagai konsumen? Kami siap membela hak Anda dengan pendekatan yang sederhana dan efektif.',
    features: [
      'Keluhan produk/jasa bermasalah',
      'Masalah dengan developer properti',
      'Masalah transaksi online dan e-commerce',
      'Mediasi dengan merchant dan penjual',
      'Konsultasi klaim asuransi',
      'Praktik perdagangan yang merugikan'
    ],
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
    hoverColor: 'hover:border-emerald-500/50',
    category: 'personal'
  },
  {
    slug: 'legalitas-properti',
    icon: HomeIcon,
    title: 'Legalitas Properti & Pertanahan',
    tagline: 'Investasi properti Anda dalam lindungan hukum',
    description: 'Transaksi properti tanpa risiko. Kami pastikan dokumen Anda aman dan sah secara hukum.',
    features: [
      'Pengecekan legalitas tanah/rumah',
      'Pendampingan jual-beli properti',
      'Pembuatan perjanjian sewa',
      'Balik nama sertifikat',
      'Konsultasi dan mediasi batas properti'
    ],
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/10',
    hoverColor: 'hover:border-violet-500/50',
    category: 'personal'
  },
  {
    slug: 'pembuatan-dokumen',
    icon: FileText,
    title: 'Pembuatan Dokumen Hukum',
    tagline: 'Dokumen legal yang sah dan mudah dipahami',
    description: 'Butuh dokumen legal yang sah? Kami siap membuatkan dengan bahasa yang jelas dan mudah dipahami.',
    features: [
      'Surat kuasa dan pernyataan',
      'Perjanjian sewa-menyewa',
      'Kontrak kerjasama',
      'Surat pemberitahuan resmi',
      'Akta notaris (via mitra notaris)',
      'Legalisasi dan penerjemahan tersumpah (via mitra)'
    ],
    color: 'from-slate-500 to-gray-600',
    bgColor: 'bg-slate-500/10',
    hoverColor: 'hover:border-slate-500/50',
    category: 'bisnis'
  }
]

const categories = [
  { value: 'all', label: 'Semua Layanan', count: 6 },
  { value: 'personal', label: 'Keluarga & Personal', count: 3 },
  { value: 'bisnis', label: 'Bisnis & Usaha', count: 3 },
]

export default function LayananPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredLayanan = layananList.filter(layanan => {
    const matchesCategory = activeTab === 'all' || layanan.category === activeTab
    const matchesSearch = layanan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         layanan.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90 pt-32 pb-20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              Layanan Lengkap
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Layanan Hukum Kami
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Kami menyediakan berbagai layanan hukum dengan pendekatan yang empatik dan profesional. 
              Temukan solusi yang tepat untuk kebutuhan Anda.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Cari layanan yang Anda butuhkan..."
                  className="pl-12 pr-4 py-6 text-lg bg-white/95 backdrop-blur-sm border-white/50 focus:border-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            
            {/* Tabs Filter */}
            <div className="mb-12">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-auto p-1.5 bg-slate-100">
                  {categories.map((cat) => (
                    <TabsTrigger 
                      key={cat.value} 
                      value={cat.value}
                      className="flex flex-col sm:flex-row items-center justify-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <span className="text-xs sm:text-sm font-medium">{cat.label}</span>
                      <Badge 
                        variant={activeTab === cat.value ? "default" : "secondary"} 
                        className="text-xs px-2"
                      >
                        {cat.count}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Results Count */}
            <div className="mb-8 flex items-center justify-between">
              <p className="text-muted-foreground">
                Menampilkan <span className="font-semibold text-foreground">{filteredLayanan.length}</span> layanan
              </p>
            </div>

            {/* Services Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {filteredLayanan.map((layanan, index) => (
                <Link key={index} href={`/layanan/${layanan.slug}`}>
                  <Card 
                    className={`group relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 ${layanan.hoverColor} h-full cursor-pointer`}
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${layanan.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                    
                    <div className="relative p-6 flex flex-col h-full">
                      {/* Icon */}
                      <div className="relative mb-4">
                        <div className={`absolute inset-0 ${layanan.bgColor} rounded-2xl blur-xl group-hover:blur-2xl transition-all`} />
                        <div className={`relative w-16 h-16 bg-gradient-to-br ${layanan.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <layanan.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {layanan.title}
                      </h3>
                      <p className="text-sm text-muted-foreground/80 italic mb-3">
                        {layanan.tagline}
                      </p>
                      <p className="text-muted-foreground mb-4 leading-relaxed text-sm">
                        {layanan.description}
                      </p>

                      {/* Features List */}
                      <div className="space-y-2 mb-4 flex-grow">
                        {layanan.features.slice(0, 4).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{feature}</span>
                          </div>
                        ))}
                        {layanan.features.length > 4 && (
                          <p className="text-sm text-muted-foreground/60 italic pl-6">
                            +{layanan.features.length - 4} layanan lainnya
                          </p>
                        )}
                      </div>

                      {/* Arrow Indicator */}
                      <div className="pt-4 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center text-primary text-sm font-medium">
                          <span>Pelajari lebih lanjut</span>
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* No Results */}
            {filteredLayanan.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Layanan tidak ditemukan</h3>
                <p className="text-muted-foreground mb-6">
                  Coba ubah kata kunci pencarian atau filter kategori Anda
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setActiveTab('all')
                  }}
                >
                  Reset Pencarian
                </Button>
              </div>
            )}

            {/* CTA Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 text-center shadow-2xl">
              <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Tidak Menemukan Layanan yang Anda Cari?
                </h3>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Hubungi kami untuk konsultasi gratis. Kami siap membantu menemukan solusi terbaik untuk kebutuhan hukum Anda.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/#kontak">
                    <Button 
                      size="lg" 
                      variant="secondary"
                      className="text-lg px-8 shadow-lg"
                    >
                      Konsultasi Gratis
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-lg px-8 bg-white/10 text-white border-white/30 hover:bg-white hover:text-primary transition-all"
                  >
                    Hubungi WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}