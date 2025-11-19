// ============================================
// FILE: app/home/_components/layout/desktop-nav.tsx
// UPDATED: PHASE 3 - Fixed white-on-white hover bug
// ============================================
'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Scale, Home, Target, Users, Briefcase, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { scrollToSection } from '@/lib/utils/scroll-utils'
import { servicesData } from '@/lib/data/services-data'

interface DesktopNavProps {
  isScrolled: boolean
}

export function DesktopNav({ isScrolled }: DesktopNavProps) {
  const linkClass = (isActive?: boolean) => cn(
    'cursor-pointer transition-colors',
    isScrolled
      ? 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
      : 'text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
    isActive && 'text-slate-900 dark:text-white font-semibold'
  )

  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList className="gap-1">
        {/* Beranda */}
        <NavigationMenuItem>
          <NavigationMenuLink
            onClick={() => scrollToSection('#hero')}
            className={cn(navigationMenuTriggerStyle(), linkClass())}
          >
            Beranda
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Tentang Kami - Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className={linkClass()}>
            Tentang Kami
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection('#tentang')
                    }}
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-slate-900 dark:bg-white p-6 no-underline outline-none focus:shadow-md cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
                  >
                    <Scale className="h-8 w-8 text-white dark:text-slate-900" />
                    <div className="mb-2 mt-4 text-lg font-medium text-white dark:text-slate-900">
                      Firma Hukum PERARI
                    </div>
                    <p className="text-sm leading-tight text-white dark:text-slate-900">
                      Partner terpercaya untuk solusi hukum Anda dengan pengalaman dan integritas.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="#tentang" title="Profil" icon={Home}>
                Kenali lebih dekat tentang firma hukum kami.
              </ListItem>
              <ListItem href="#visi-misi" title="Visi & Misi" icon={Target}>
                Tujuan dan komitmen kami dalam memberikan layanan hukum.
              </ListItem>
              <ListItem href="#tim" title="Tim Kami" icon={Users}>
                Advokat profesional yang siap membantu Anda.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Layanan - Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className={linkClass()}>
            Layanan
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {servicesData.slice(0, 6).map((service) => (
                <ListItem
                  key={service.slug}
                  title={service.title}
                  href={`/layanan/${service.slug}`}
                  icon={service.icon}
                  isLink
                >
                  {service.tagline}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Kontak */}
        <NavigationMenuItem>
          <NavigationMenuLink
            onClick={() => scrollToSection('#kontak')}
            className={cn(navigationMenuTriggerStyle(), linkClass())}
          >
            Kontak
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

interface ListItemProps {
  title: string
  children: React.ReactNode
  href: string
  icon?: any
  isLink?: boolean
}

function ListItem({ title, children, href, icon: Icon, isLink }: ListItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!isLink) {
      e.preventDefault()
      scrollToSection(href)
    }
  }

  const Component = isLink ? 'a' : 'a'

  return (
    <li>
      <NavigationMenuLink asChild>
        <Component
          href={isLink ? href : undefined}
          onClick={handleClick}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon className="w-4 h-4 text-slate-900 dark:text-white group-hover:scale-110 transition-transform" />
            )}
            <div className="text-sm font-medium leading-none text-slate-900 dark:text-white">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-slate-600 dark:text-slate-400">
            {children}
          </p>
        </Component>
      </NavigationMenuLink>
    </li>
  )
}
