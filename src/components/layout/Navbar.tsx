'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, Heart, Search, ChevronDown, LayoutDashboard, LogOut, Shield, FileText } from 'lucide-react'
import { NotificationBadge } from './NotificationBadge'

export function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const role = (session?.user as any)?.role

  return (
    <nav className="sticky top-0 z-50 bg-dark/95 backdrop-blur-md border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-cormorant text-2xl font-bold text-gradient-rose-gold">
              MonPrestataire
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/recherche" className="text-white/70 hover:text-white transition-colors text-sm flex items-center gap-1">
              <Search size={15} />
              Rechercher
            </Link>
            <Link href="/demandes" className="text-white/70 hover:text-white transition-colors text-sm">
              Demandes clients
            </Link>
            <Link href="/blog" className="text-white/70 hover:text-white transition-colors text-sm">
              Blog
            </Link>
            <Link href="/inscription" className="text-white/70 hover:text-rose transition-colors text-sm font-medium">
              Devenir prestataire
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {session && (role === 'PROVIDER' || role === 'ADMIN') && (
              <NotificationBadge />
            )}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-sm text-white hover:border-rose/30 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose to-gold flex items-center justify-center text-xs font-bold text-white">
                    {session.user?.name?.[0] || 'U'}
                  </div>
                  <span className="max-w-24 truncate">{session.user?.name || session.user?.email}</span>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-dark-card border border-dark-border rounded-xl shadow-xl py-2 z-50">
                    {role === 'PROVIDER' && (
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-dark transition-colors">
                        <LayoutDashboard size={15} /> Mon tableau de bord
                      </Link>
                    )}
                    {(!role || role === 'CLIENT') && (
                      <Link href="/espace-client" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-dark transition-colors">
                        <LayoutDashboard size={15} /> Mon espace
                      </Link>
                    )}
                    {role === 'ADMIN' && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-rose hover:bg-rose/10 transition-colors">
                        <Shield size={15} /> Administration
                      </Link>
                    )}
                    <Link href="/favoris" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-dark transition-colors">
                      <Heart size={15} /> Mes favoris
                    </Link>
                    <Link href="/mes-demandes" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-dark transition-colors">
                      <FileText size={15} /> Mes demandes
                    </Link>
                    <div className="border-t border-dark-border my-2" />
                    <Link href="/compte" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-dark transition-colors">
                      <Shield size={15} className="opacity-50" /> Paramètres du compte
                    </Link>
                    <button onClick={() => { signOut(); setUserMenuOpen(false) }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-dark transition-colors w-full">
                      <LogOut size={15} /> Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/connexion" className="text-white/70 hover:text-white text-sm transition-colors">
                  Connexion
                </Link>
                <div className="flex flex-col gap-1">
                  <Link href="/inscription" className="btn-primary text-sm py-1.5 px-4 text-center">
                    S&apos;inscrire (prestataire)
                  </Link>
                  <Link href="/inscription-client" className="btn-secondary text-sm py-1.5 px-4 text-center">
                    S&apos;inscrire (client)
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-dark-card border-t border-dark-border px-4 py-4 space-y-3">
          <Link href="/recherche" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-white/80 py-2">
            <Search size={16} /> Rechercher
          </Link>
          <Link href="/demandes" onClick={() => setMobileOpen(false)} className="block text-white/80 py-2">
            Demandes clients
          </Link>
          <Link href="/blog" onClick={() => setMobileOpen(false)} className="block text-white/70 py-2">
            Blog
          </Link>
          <Link href="/inscription" onClick={() => setMobileOpen(false)} className="block text-rose py-2 font-medium">
            Devenir prestataire
          </Link>
          {session ? (
            <>
              {role === 'PROVIDER' && (
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block text-white/80 py-2">
                  Mon tableau de bord
                </Link>
              )}
              {role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="block text-rose py-2">
                  Administration
                </Link>
              )}
              <Link href="/favoris" onClick={() => setMobileOpen(false)} className="block text-white/80 py-2">
                Mes favoris
              </Link>
              <Link href="/mes-demandes" onClick={() => setMobileOpen(false)} className="block text-white/80 py-2">
                Mes demandes
              </Link>
              <Link href="/compte" onClick={() => setMobileOpen(false)} className="block text-white/50 py-2">
                Paramètres du compte
              </Link>
              <button onClick={() => { signOut(); setMobileOpen(false) }} className="block text-white/50 py-2 text-left">
                Se déconnecter
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/connexion" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm py-2 px-4 text-center">
                Connexion
              </Link>
              <Link href="/inscription" onClick={() => setMobileOpen(false)} className="btn-primary text-sm py-2 px-4 text-center">
                S&apos;inscrire (prestataire)
              </Link>
              <Link href="/inscription-client" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm py-2 px-4 text-center">
                S&apos;inscrire (client)
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

