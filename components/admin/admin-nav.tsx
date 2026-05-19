'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, CalendarDays, Users, Scissors,
  Image as ImageIcon, Star, ListOrdered, Settings, LogOut, Menu
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/calendar', label: 'Kalendar', icon: CalendarDays },
  { href: '/admin/clients', label: 'Klijenti', icon: Users },
  { href: '/admin/staff', label: 'Osoblje', icon: Users },
  { href: '/admin/services', label: 'Usluge', icon: Scissors },
  { href: '/admin/gallery', label: 'Galerija', icon: ImageIcon },
  { href: '/admin/reviews', label: 'Recenzije', icon: Star },
  { href: '/admin/waitlist', label: 'Čekanje', icon: ListOrdered },
  { href: '/admin/settings', label: 'Podešavanja', icon: Settings },
]

function NavLinks({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5">
        <span className="text-xl font-bold" style={{ color: '#e91e8c' }}>beauty.</span>
        <p className="text-xs text-muted-foreground mt-0.5">Admin panel</p>
      </div>
      <nav className="flex-1 px-2 space-y-0.5" data-testid="admin-nav">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-pink-50 text-pink-600 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-gray-100'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-2 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-gray-100 w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Odjavi se
        </button>
      </div>
    </div>
  )
}

export function AdminNav() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r bg-white min-h-screen sticky top-0">
        <NavLinks />
      </aside>

      {/* Mobile: top bar + sheet drawer */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b h-14 flex items-center px-4">
        <Sheet>
          <SheetTrigger
            className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            data-testid="mobile-menu-button"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0" data-testid="mobile-nav-drawer">
            <NavLinks />
          </SheetContent>
        </Sheet>
        <span className="ml-3 text-lg font-bold" style={{ color: '#e91e8c' }}>beauty.</span>
      </div>

      {/* Spacer for mobile top bar */}
      <div className="lg:hidden h-14 w-full" />
    </>
  )
}
