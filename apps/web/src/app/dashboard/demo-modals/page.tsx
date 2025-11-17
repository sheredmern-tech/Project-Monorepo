"use client"

import * as React from "react"
import { UserIcon, UsersIcon, SearchIcon, SparklesIcon } from "lucide-react"
import { SelectKlienModal } from "@/components/modals/select-klien-modal"
import { SelectAdvokatModal } from "@/components/modals/select-advokat-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { KlienBasic } from "@/types/entities/klien"
import { UserBasic } from "@/types/entities/user"

export default function DemoModalsPage() {
  const [openKlien, setOpenKlien] = React.useState(false)
  const [openAdvokat, setOpenAdvokat] = React.useState(false)
  const [selectedKlien, setSelectedKlien] = React.useState<KlienBasic | null>(null)
  const [selectedAdvokat, setSelectedAdvokat] = React.useState<UserBasic | null>(null)

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <SparklesIcon className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Searchable Modal Selection
            </h1>
            <p className="text-muted-foreground mt-1">
              Modern UI pattern untuk memilih data dengan search functionality
            </p>
          </div>
        </div>
      </div>

      {/* Feature Description */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="size-5" />
            Konsep & Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <div className="flex items-start gap-2">
              <Badge variant="default" className="mt-0.5">1</Badge>
              <p className="text-sm">
                <strong>Click to Open:</strong> User klik button → BOOM langsung muncul modal dengan list
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="default" className="mt-0.5">2</Badge>
              <p className="text-sm">
                <strong>Search & Filter:</strong> Real-time search functionality untuk filter data
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="default" className="mt-0.5">3</Badge>
              <p className="text-sm">
                <strong>Select Item:</strong> Click item untuk select → Modal close otomatis
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="default" className="mt-0.5">4</Badge>
              <p className="text-sm">
                <strong>Smooth & Modern:</strong> Smooth animations, hover effects, dan keyboard navigation
              </p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              <strong>Why better than dropdown?</strong> Users punya lebih banyak context saat milih,
              dengan avatar, metadata, dan search yang powerful!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Demo Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Select Klien Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="size-5" />
              Select Klien
            </CardTitle>
            <CardDescription>
              Modal untuk memilih klien dengan search by nama, email, atau telepon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setOpenKlien(true)}
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
            >
              <UsersIcon className="size-4" />
              <span>Pilih Klien</span>
            </Button>

            {selectedKlien ? (
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Selected Klien:</p>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedKlien.nama.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{selectedKlien.nama}</p>
                      <Badge variant="secondary" className="text-xs">
                        {selectedKlien.jenis_klien}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{selectedKlien.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                Belum ada klien dipilih
              </div>
            )}
          </CardContent>
        </Card>

        {/* Select Advokat Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="size-5" />
              Assign Advokat
            </CardTitle>
            <CardDescription>
              Modal untuk assign advokat dengan search by nama atau email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setOpenAdvokat(true)}
              variant="outline"
              className="w-full justify-start gap-2 h-auto py-3"
            >
              <UserIcon className="size-4" />
              <span>Assign Advokat</span>
            </Button>

            {selectedAdvokat ? (
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Selected Advokat:</p>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    {selectedAdvokat.avatar_url && (
                      <AvatarImage src={selectedAdvokat.avatar_url} alt={selectedAdvokat.nama_lengkap || ""} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(selectedAdvokat.nama_lengkap || "?").split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {selectedAdvokat.nama_lengkap || "Nama tidak tersedia"}
                      </p>
                      <Badge variant="default" className="text-xs">
                        {selectedAdvokat.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{selectedAdvokat.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                Belum ada advokat dipilih
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Use Cases Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Use Cases di Firma App</CardTitle>
          <CardDescription>
            Pattern ini bisa digunakan di berbagai fitur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 border rounded-lg">
              <p className="font-medium text-sm mb-1">Select Klien</p>
              <p className="text-xs text-muted-foreground">
                Pilih klien saat buat perkara baru
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium text-sm mb-1">Assign Advokat</p>
              <p className="text-xs text-muted-foreground">
                Assign advokat ke tim perkara
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium text-sm mb-1">Template Dokumen</p>
              <p className="text-xs text-muted-foreground">
                Pilih template saat upload dokumen
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium text-sm mb-1">Status Case</p>
              <p className="text-xs text-muted-foreground">
                Update status perkara dengan mudah
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <SelectKlienModal
        open={openKlien}
        onOpenChange={setOpenKlien}
        onSelect={(klien) => {
          setSelectedKlien(klien)
          console.log("Selected klien:", klien)
        }}
      />

      <SelectAdvokatModal
        open={openAdvokat}
        onOpenChange={setOpenAdvokat}
        onSelect={(advokat) => {
          setSelectedAdvokat(advokat)
          console.log("Selected advokat:", advokat)
        }}
      />
    </div>
  )
}
