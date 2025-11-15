// ============================================
// FILE: app/layanan/[slug]/page.tsx
// ============================================
'use client'

import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
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
  Clock,
  Phone,
  Mail,
  MessageCircle,
  AlertCircle
} from 'lucide-react'

const layananData: Record<string, any> = {
  'hukum-keluarga': {
    icon: Heart,
    title: 'Hukum Keluarga',
    tagline: 'Karena setiap keluarga punya cerita unik',
    description: 'Kami memahami setiap keluarga punya cerita unik. Dengan pendekatan yang empatik dan profesional, kami siap membantu menyelesaikan permasalahan keluarga Anda.',
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-500/10',
    overview: 'Masalah keluarga seringkali sensitif dan membutuhkan penanganan yang hati-hati. Kami hadir untuk memberikan solusi hukum yang tidak hanya secara legal benar, tetapi juga mempertimbangkan aspek emosional dan kemanusiaan dari setiap kasus yang kami tangani.',
    services: [
      {
        title: 'Mediasi Keluarga dan Penyelesaian Damai',
        description: 'Memfasilitasi dialog konstruktif antar anggota keluarga untuk mencapai solusi yang saling menguntungkan tanpa perlu ke jalur pengadilan.'
      },
      {
        title: 'Konsultasi Hak Asuh Anak',
        description: 'Memberikan panduan hukum terkait hak asuh anak, termasuk pengaturan kunjungan dan tanggung jawab orang tua.'
      },
      {
        title: 'Pembuatan Perjanjian Pranikah',
        description: 'Menyusun perjanjian pranikah yang adil dan sesuai hukum untuk melindungi hak dan kewajiban kedua belah pihak.'
      },
      {
        title: 'Konsultasi Warisan dan Hibah',
        description: 'Membantu perencanaan dan pembagian warisan sesuai hukum Islam atau perdata yang berlaku.'
      },
      {
        title: 'Pembuatan Surat Wasiat',
        description: 'Menyusun surat wasiat yang sah secara hukum untuk memastikan keinginan Anda terlaksana dengan baik.'
      },
      {
        title: 'Adopsi dan Perwalian Anak',
        description: 'Mendampingi proses adopsi dan perwalian anak sesuai prosedur hukum yang berlaku.'
      }
    ],
    approach: [
      'Mendengarkan dengan empati tanpa menghakimi',
      'Mencari solusi yang mengutamakan kepentingan semua pihak',
      'Menjaga kerahasiaan dan privasi klien',
      'Memberikan konsultasi dengan bahasa yang mudah dipahami'
    ],
    faqs: [
      {
        question: 'Berapa lama proses mediasi keluarga?',
        answer: 'Durasi mediasi bervariasi tergantung kompleksitas kasus, biasanya 1-3 pertemuan. Kami fokus pada kualitas dialog untuk mencapai kesepakatan yang berkelanjutan.'
      },
      {
        question: 'Apakah perjanjian pranikah bisa dibatalkan?',
        answer: 'Perjanjian pranikah yang sudah disahkan tidak dapat dibatalkan secara sepihak. Namun dapat diubah dengan kesepakatan kedua belah pihak dan disahkan kembali.'
      }
    ]
  },
  'konsultasi-bisnis-umkm': {
    icon: Briefcase,
    title: 'Konsultasi Bisnis & UMKM',
    tagline: 'Wujudkan bisnis impian Anda dengan aman',
    description: 'Mulai atau kembangkan bisnis Anda dengan aman. Kami hadir untuk mendampingi pengusaha pemula hingga UMKM dengan solusi hukum yang mudah dipahami.',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500/10',
    overview: 'Memulai dan mengembangkan bisnis membutuhkan fondasi hukum yang kuat. Kami membantu para pengusaha, mulai dari pendirian badan usaha hingga perlindungan aset bisnis, dengan pendekatan yang praktis dan mudah dipahami.',
    services: [
      {
        title: 'Pendirian PT, CV, dan Badan Usaha',
        description: 'Membantu proses pendirian perusahaan dari awal hingga selesai, termasuk pengurusan dokumen dan legalitas.'
      },
      {
        title: 'Pembuatan Kontrak Bisnis Sederhana',
        description: 'Menyusun kontrak bisnis yang jelas dan melindungi kepentingan usaha Anda dengan bahasa yang mudah dipahami.'
      },
      {
        title: 'Pendaftaran Merek dan Hak Cipta',
        description: 'Mendampingi proses pendaftaran merek dagang dan hak cipta untuk melindungi aset intelektual bisnis Anda.'
      },
      {
        title: 'Review Perjanjian Kerjasama',
        description: 'Menganalisis dan memberikan masukan terhadap perjanjian kerjasama sebelum Anda menandatangani.'
      },
      {
        title: 'Konsultasi Perizinan Usaha',
        description: 'Membantu memahami dan mengurus izin-izin usaha yang diperlukan sesuai bidang bisnis Anda.'
      }
    ],
    approach: [
      'Konsultasi dengan bahasa yang mudah dipahami',
      'Solusi praktis dan efisien untuk UMKM',
      'Transparansi biaya sejak awal',
      'Pendampingan berkelanjutan untuk perkembangan bisnis'
    ],
    faqs: [
      {
        question: 'Berapa lama proses pendirian PT?',
        answer: 'Proses pendirian PT biasanya memakan waktu 7-14 hari kerja, tergantung kelengkapan dokumen dan proses di instansi terkait.'
      },
      {
        question: 'Apakah UMKM perlu mendaftarkan merek?',
        answer: 'Sangat disarankan untuk melindungi identitas brand Anda dari pemalsuan atau penggunaan tanpa izin oleh pihak lain.'
      }
    ]
  },
  'hukum-ketenagakerjaan': {
    icon: Users,
    title: 'Hukum Ketenagakerjaan',
    tagline: 'Hubungan kerja yang adil untuk semua',
    description: 'Baik Anda karyawan atau pengusaha, kami bantu pastikan hubungan kerja berjalan adil dan sesuai aturan.',
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-500/10',
    overview: 'Hubungan kerja yang sehat adalah kunci kesuksesan bisnis. Kami membantu pekerja dan pengusaha memahami hak dan kewajiban masing-masing, serta menyelesaikan perselisihan dengan pendekatan yang adil.',
    services: [
      {
        title: 'Konsultasi Pemutusan Hubungan Kerja',
        description: 'Memberikan panduan hukum terkait PHK, baik untuk karyawan maupun perusahaan, sesuai UU Ketenagakerjaan.'
      },
      {
        title: 'Pembuatan Kontrak Kerja',
        description: 'Menyusun kontrak kerja yang jelas dan sesuai peraturan untuk melindungi kepentingan kedua belah pihak.'
      },
      {
        title: 'Konsultasi Hak dan Kompensasi Karyawan',
        description: 'Membantu memahami hak-hak karyawan termasuk upah, cuti, tunjangan, dan kompensasi lainnya.'
      },
      {
        title: 'Mediasi Masalah Tempat Kerja',
        description: 'Memfasilitasi penyelesaian konflik di tempat kerja secara damai dan profesional.'
      },
      {
        title: 'Review Peraturan Perusahaan',
        description: 'Menganalisis dan memastikan peraturan perusahaan sudah sesuai dengan UU Ketenagakerjaan yang berlaku.'
      }
    ],
    approach: [
      'Netral dan objektif dalam setiap kasus',
      'Mengutamakan solusi win-win solution',
      'Memahami perspektif karyawan dan perusahaan',
      'Proses mediasi yang efektif dan efisien'
    ],
    faqs: [
      {
        question: 'Apa saja hak karyawan saat di-PHK?',
        answer: 'Karyawan berhak mendapat uang pesangon, uang penghargaan masa kerja, dan uang penggantian hak sesuai ketentuan UU Ketenagakerjaan dan masa kerja.'
      },
      {
        question: 'Apakah perusahaan wajib membuat kontrak kerja tertulis?',
        answer: 'Ya, setiap hubungan kerja harus dibuat dalam bentuk perjanjian kerja tertulis atau Perjanjian Kerja Bersama (PKB).'
      }
    ]
  },
  'perlindungan-konsumen': {
    icon: ShieldCheck,
    title: 'Perlindungan Konsumen',
    tagline: 'Hak Anda sebagai konsumen adalah prioritas kami',
    description: 'Merasa dirugikan sebagai konsumen? Kami siap membela hak Anda dengan pendekatan yang sederhana dan efektif.',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
    overview: 'Sebagai konsumen, Anda berhak mendapatkan produk dan layanan yang sesuai dengan yang dijanjikan. Kami membantu Anda menuntut hak ketika mengalami kerugian atau ketidakadilan dalam bertransaksi.',
    services: [
      {
        title: 'Keluhan Produk/Jasa Bermasalah',
        description: 'Membantu menyampaikan keluhan dan menuntut hak Anda atas produk atau jasa yang tidak sesuai standar.'
      },
      {
        title: 'Masalah dengan Developer Properti',
        description: 'Mendampingi konsumen yang mengalami masalah dengan developer, seperti keterlambatan atau cacat bangunan.'
      },
      {
        title: 'Masalah Transaksi Online dan E-commerce',
        description: 'Menangani sengketa transaksi online, mulai dari barang tidak sampai hingga produk tidak sesuai.'
      },
      {
        title: 'Mediasi dengan Merchant dan Penjual',
        description: 'Memfasilitasi dialog dengan penjual atau penyedia jasa untuk mencapai penyelesaian yang adil.'
      },
      {
        title: 'Konsultasi Klaim Asuransi',
        description: 'Membantu proses klaim asuransi yang ditolak atau berbelit-belit.'
      },
      {
        title: 'Praktik Perdagangan yang Merugikan',
        description: 'Menangani kasus praktik perdagangan tidak adil seperti iklan menyesatkan atau harga yang tidak wajar.'
      }
    ],
    approach: [
      'Langkah pertama selalu mediasi damai',
      'Dokumentasi bukti yang kuat',
      'Komunikasi efektif dengan pihak terkait',
      'Jalur hukum sebagai opsi terakhir'
    ],
    faqs: [
      {
        question: 'Apa yang harus dilakukan jika barang online tidak sesuai?',
        answer: 'Segera dokumentasikan (foto/video), hubungi seller, jika tidak responsif laporkan ke platform. Kami siap membantu jika diperlukan mediasi lebih lanjut.'
      },
      {
        question: 'Berapa lama proses penyelesaian sengketa konsumen?',
        answer: 'Tergantung kompleksitas kasus. Mediasi biasanya 1-2 minggu, jika ke jalur BPSK bisa 1-3 bulan.'
      }
    ]
  },
  'legalitas-properti': {
    icon: HomeIcon,
    title: 'Legalitas Properti & Pertanahan',
    tagline: 'Investasi properti Anda dalam lindungan hukum',
    description: 'Transaksi properti tanpa risiko. Kami pastikan dokumen Anda aman dan sah secara hukum.',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/10',
    overview: 'Properti adalah investasi besar yang memerlukan perlindungan hukum yang kuat. Kami membantu memastikan setiap transaksi properti Anda aman dari sisi legal, mulai dari pengecekan dokumen hingga proses balik nama.',
    services: [
      {
        title: 'Pengecekan Legalitas Tanah/Rumah',
        description: 'Melakukan verifikasi menyeluruh terhadap dokumen kepemilikan, status tanah, dan riwayat hukum properti.'
      },
      {
        title: 'Pendampingan Jual-Beli Properti',
        description: 'Mendampingi proses jual beli dari awal hingga selesai untuk memastikan transaksi aman dan legal.'
      },
      {
        title: 'Pembuatan Perjanjian Sewa',
        description: 'Menyusun perjanjian sewa properti yang melindungi hak pemilik dan penyewa.'
      },
      {
        title: 'Balik Nama Sertifikat',
        description: 'Membantu proses balik nama sertifikat tanah dan properti di kantor pertanahan.'
      },
      {
        title: 'Konsultasi dan Mediasi Batas Properti',
        description: 'Menangani sengketa batas tanah dengan tetangga melalui mediasi atau jalur hukum.'
      }
    ],
    approach: [
      'Due diligence menyeluruh',
      'Transparansi status legal properti',
      'Koordinasi dengan instansi terkait',
      'Dokumen lengkap dan aman'
    ],
    faqs: [
      {
        question: 'Dokumen apa saja yang perlu dicek saat beli properti?',
        answer: 'Sertifikat asli, IMB, PBB, riwayat kepemilikan, dan memastikan tidak ada sengketa atau agunan di properti tersebut.'
      },
      {
        question: 'Berapa lama proses balik nama sertifikat?',
        answer: 'Proses balik nama di BPN biasanya 7-30 hari kerja tergantung wilayah dan kelengkapan dokumen.'
      }
    ]
  },
  'pembuatan-dokumen': {
    icon: FileText,
    title: 'Pembuatan Dokumen Hukum',
    tagline: 'Dokumen legal yang sah dan mudah dipahami',
    description: 'Butuh dokumen legal yang sah? Kami siap membuatkan dengan bahasa yang jelas dan mudah dipahami.',
    color: 'from-slate-500 to-gray-600',
    bgColor: 'bg-slate-500/10',
    overview: 'Dokumen hukum yang baik adalah fondasi penting dalam berbagai aspek kehidupan. Kami membantu menyusun berbagai dokumen legal dengan bahasa yang jelas, memastikan hak dan kewajiban Anda terlindungi dengan baik.',
    services: [
      {
        title: 'Surat Kuasa dan Pernyataan',
        description: 'Menyusun surat kuasa untuk berbagai keperluan legal dan surat pernyataan yang sah secara hukum.'
      },
      {
        title: 'Perjanjian Sewa-Menyewa',
        description: 'Membuat perjanjian sewa rumah, kendaraan, atau aset lainnya yang melindungi kedua belah pihak.'
      },
      {
        title: 'Kontrak Kerjasama',
        description: 'Menyusun kontrak kerjasama bisnis yang jelas, adil, dan sesuai hukum yang berlaku.'
      },
      {
        title: 'Surat Pemberitahuan Resmi',
        description: 'Membuat surat pemberitahuan, somasi, atau korespondensi resmi lainnya.'
      },
      {
        title: 'Akta Notaris (via mitra notaris)',
        description: 'Memfasilitasi pembuatan akta notaris melalui notaris mitra kami yang terpercaya.'
      },
      {
        title: 'Legalisasi dan Penerjemahan Tersumpah',
        description: 'Membantu proses legalisasi dokumen dan penerjemahan tersumpah melalui mitra resmi.'
      }
    ],
    approach: [
      'Bahasa yang jelas dan mudah dipahami',
      'Memastikan kelengkapan klausul penting',
      'Review menyeluruh sebelum finalisasi',
      'Konsultasi untuk memahami isi dokumen'
    ],
    faqs: [
      {
        question: 'Apa bedanya surat kuasa biasa dengan surat kuasa notaris?',
        answer: 'Surat kuasa biasa cukup untuk urusan sederhana, sedangkan surat kuasa notaris memiliki kekuatan hukum lebih kuat dan diperlukan untuk urusan yang membutuhkan autentikasi.'
      },
      {
        question: 'Berapa lama proses pembuatan kontrak?',
        answer: 'Tergantung kompleksitas, biasanya 2-5 hari kerja untuk kontrak standar. Kami prioritaskan kualitas dan kejelasan setiap klausul.'
      }
    ]
  }
}

export default function LayananDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const layanan = layananData[slug]

  if (!layanan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Layanan tidak ditemukan</h1>
          <Link href="/layanan">
            <Button>Kembali ke Layanan</Button>
          </Link>
        </div>
      </div>
    )
  }

  const Icon = layanan.icon

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section id="hero" className={`relative overflow-hidden bg-gradient-to-br ${layanan.color} pt-32 pb-20`}>
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-8">
              <BreadcrumbList className="text-white/80">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="hover:text-white">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/layanan" className="hover:text-white">Layanan</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/60" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white font-medium">{layanan.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Header Content */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div className={`absolute inset-0 ${layanan.bgColor} rounded-3xl blur-2xl opacity-50`} />
                <div className="relative w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
                  <Icon className="w-12 h-12 text-white" strokeWidth={1.5} />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1">
                <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
                  Layanan Profesional
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {layanan.title}
                </h1>
                <p className="text-xl text-white/90 mb-6 italic">
                  {layanan.tagline}
                </p>
                <p className="text-lg text-white/80 leading-relaxed mb-8">
                  {layanan.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="shadow-lg"
                    asChild
                  >
                    <Link href="/#kontak">
                      Konsultasi Sekarang
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-primary backdrop-blur-sm"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Hubungi Kami
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            
            {/* Overview */}
            <Card className="mb-12 p-8 border-2">
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-4">Gambaran Umum</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {layanan.overview}
                  </p>
                </div>
              </div>
            </Card>

            {/* Services List */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Layanan yang Kami Tawarkan</h2>
              <div className="grid gap-6">
                {layanan.services.map((service: any, index: number) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: `hsl(var(--primary))` }}>
                    <div className="flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator className="my-12" />

            {/* Our Approach */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Pendekatan Kami</h2>
              <Card className="p-8 bg-gradient-to-br from-slate-50 to-white">
                <div className="grid md:grid-cols-2 gap-4">
                  {layanan.approach.map((item: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      <p className="text-muted-foreground leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Separator className="my-12" />

            {/* FAQs */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Pertanyaan yang Sering Diajukan</h2>
              <div className="space-y-6">
                {layanan.faqs.map((faq: any, index: number) => (
                  <Card key={index} className="p-6">
                    <h3 className="text-lg font-semibold mb-3 text-primary">{faq.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <Card className={`relative overflow-hidden bg-gradient-to-br ${layanan.color} p-10 text-center border-0`}>
              <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Siap Memulai Konsultasi?
                </h3>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                  Hubungi kami sekarang untuk mendapatkan konsultasi gratis. Tim kami siap membantu menyelesaikan permasalahan hukum Anda.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="shadow-lg"
                    asChild
                  >
                    <Link href="/#kontak">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Konsultasi Gratis
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-primary"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Hubungi WhatsApp
                  </Button>
                </div>
              </div>
            </Card>

            {/* Related Services */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-6">Layanan Lainnya</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(layananData)
                  .filter(([key]) => key !== slug)
                  .slice(0, 3)
                  .map(([key, data]: [string, any]) => {
                    const RelatedIcon = data.icon
                    return (
                      <Link key={key} href={`/layanan/${key}`}>
                        <Card className="p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group">
                          <div className={`w-14 h-14 bg-gradient-to-br ${data.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <RelatedIcon className="w-7 h-7 text-white" strokeWidth={1.5} />
                          </div>
                          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                            {data.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {data.description}
                          </p>
                          <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Pelajari lebih lanjut</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}