// ============================================================================
// FILE 1: app/(auth)/layout.tsx - ✅ FIXED alt-text
// ============================================================================
import { Image } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE - Cover Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/90 to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Image className="w-12 h-12 text-white" strokeWidth={1.5} aria-label="Logo Firma Hukum" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-center mb-4">
            Sistem Manajemen Hukum
          </h1>
          <p className="text-xl text-white/80 text-center max-w-md">
            Platform terpadu untuk mengelola kasus, klien, dan dokumen hukum Anda dengan efisien
          </p>

          {/* Decorative Elements */}
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div className="backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-sm text-white/80">Kasus Selesai</div>
            </div>
            <div className="backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold mb-1">100+</div>
              <div className="text-sm text-white/80">Klien Aktif</div>
            </div>
            <div className="backdrop-blur-sm bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold mb-1">50+</div>
              <div className="text-sm text-white/80">Tim Advokat</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
