'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Home, Search, Heart, LayoutDashboard, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/recherche', label: 'Recherche', icon: Search },
  { href: '/favoris', label: 'Favoris', icon: Heart, auth: true },
  { href: '/dashboard', label: 'Espace', icon: LayoutDashboard, auth: true },
  { href: '/connexion', label: 'Connexion', icon: LogIn, guestOnly: true },
]

export function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const items = NAV.filter(item => {
    if (item.auth && !session) return false
    if (item.guestOnly && session) return false
    return true
  })

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-dark-card border-t border-dark-border safe-bottom">
      <div className="flex items-stretch">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs transition-colors',
                active ? 'text-rose' : 'text-white/40 hover:text-white/70'
              )}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
              <span className="font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

