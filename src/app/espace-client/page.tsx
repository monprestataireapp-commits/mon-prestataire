'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, FileText, Search, Star, Bell, ChevronRight, User } from 'lucide-react'

export default function EspaceClientPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({ favorites: 0, demandes: 0 })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/connexion')
  }, [status, router])

  useEffect(() => {
    if (!session) return
    Promise.all([
      fetch('/api/favorites/count').then(r => r.ok ? r.json() : { count: 0 }),
      fetch('/api/demandes/count').then(r => r.ok ? r.json() : { count: 0 }),
    ]).then(([fav, dem]) => setStats({ favorites: fav.count ?? 0, demandes: dem.count ?? 0 }))
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const name = session?.user?.name || session?.user?.email?.split('@')[0] || 'vous'

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose to-gold flex items-center justify-center text-white text-xl font-bold font-cormorant">
          {name[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="font-cormorant text-3xl font-bold text-white">Bonjour, {name} 👋</h1>
          <p className="text-white/50 text-sm">Votre espace MonPrestataire</p>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <Heart size={18} className="text-rose" />
            <span className="text-2xl font-bold text-white font-cormorant">{stats.favorites}</span>
          </div>
          <p className="text-white/50 text-sm">Favoris sauvegardés</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <FileText size={18} className="text-rose" />
            <span className="text-2xl font-bold text-white font-cormorant">{stats.demandes}</span>
          </div>
          <p className="text-white/50 text-sm">Demandes publiées</p>
        </div>
      </div>

      {/* Actions principales */}
      <div className="space-y-3 mb-8">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Accès rapide</h2>
        {[
          { href: '/recherche', icon: Search, label: 'Rechercher un prestataire', sub: 'Photographes, traiteurs, DJ et plus encore', color: 'bg-rose/10 text-rose' },
          { href: '/favoris', icon: Heart, label: 'Mes favoris', sub: `${stats.favorites} prestataire${stats.favorites > 1 ? 's' : ''} sauvegardé${stats.favorites > 1 ? 's' : ''}`, color: 'bg-rose/10 text-rose' },
          { href: '/mes-demandes', icon: FileText, label: 'Mes demandes', sub: `${stats.demandes} demande${stats.demandes > 1 ? 's' : ''} publiée${stats.demandes > 1 ? 's' : ''}`, color: 'bg-gold/10 text-gold' },
          { href: '/demandes', icon: Bell, label: 'Voir les offres disponibles', sub: 'Parcourir les demandes d\'autres clients', color: 'bg-dark text-white/50' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-4 bg-dark-card border border-dark-border rounded-xl px-5 py-4 hover:border-rose/30 transition-colors group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
              <item.icon size={18} />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{item.label}</p>
              <p className="text-white/40 text-xs">{item.sub}</p>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-rose transition-colors" />
          </Link>
        ))}
      </div>

      {/* Devenir prestataire CTA */}
      <div className="bg-gradient-to-br from-rose/5 to-gold/5 border border-rose/15 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center shrink-0">
            <Star size={18} className="text-rose" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm mb-1">Vous êtes prestataire indépendant ?</h3>
            <p className="text-white/50 text-xs mb-3">Créez votre profil et rejoignez 500+ professionnels. Offre lancement : 6 mois gratuits.</p>
            <Link href="/inscription" className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-1.5">
              <User size={14} /> Créer mon profil prestataire
            </Link>
          </div>
        </div>
      </div>

      {/* Compte */}
      <div className="mt-6 pt-6 border-t border-dark-border">
        <Link href="/compte" className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
          <User size={14} /> Paramètres du compte
        </Link>
      </div>
    </div>
  )
}
