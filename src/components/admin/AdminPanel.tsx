'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CheckCircle, XCircle, Eye, EyeOff, Shield, Users, Zap, Star, MessageSquare, Mail, Download, BarChart2, TrendingUp, Trash2, ExternalLink, UserPlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'stats' | 'providers' | 'clients' | 'reviews' | 'newsletter'

const EMPTY_FORM = { name: '', email: '', password: '', businessName: '', city: '', region: '', months: '6' }

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>('stats')
  const [providers, setProviders] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [newsletters, setNewsletters] = useState<string[]>([])
  const [foundingCount, setFoundingCount] = useState(0)
  const [editingFoundingCount, setEditingFoundingCount] = useState(false)
  const [foundingCountInput, setFoundingCountInput] = useState('')
  const [foundingCountSaving, setFoundingCountSaving] = useState(false)
  const [globalStats, setGlobalStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'premium'>('all')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_FORM)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [pRes, rRes, nRes, sRes, cRes] = await Promise.all([
      fetch('/api/admin/providers').then(r => r.json()),
      fetch('/api/admin/reviews').then(r => r.json()),
      fetch('/api/admin/newsletter').then(r => r.json()),
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/admin/clients').then(r => r.json()),
    ])
    setProviders(pRes.providers || [])
    setFoundingCount(pRes.foundingCount || 0)
    setReviews(rRes.reviews || [])
    setNewsletters(nRes.emails || [])
    setGlobalStats(sRes)
    setClients(cRes.clients || [])
    setLoading(false)
  }

  function exportCsv() {
    const csv = 'Email\n' + newsletters.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'newsletter.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  function exportProvidersCsv() {
    const header = 'Nom;Email;Ville;Région;Formule;Statut;Vérifié;Fondateur;Vues;Favoris;Avis\n'
    const rows = providers.map(p =>
      [
        p.businessName,
        p.user?.email || '',
        p.city || '',
        p.region || '',
        p.subscriptionPlan || '',
        p.subscriptionStatus || '',
        p.isVerified ? 'Oui' : 'Non',
        p.isFoundingMember ? 'Oui' : 'Non',
        p.profileViews || 0,
        p._count?.favorites || 0,
        p._count?.reviews || 0,
      ].join(';')
    ).join('\n')
    const csv = '﻿' + header + rows // BOM for Excel
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'prestataires.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  async function providerAction(providerId: string, action: string) {
    await fetch('/api/admin/providers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, action }),
    })
    loadData()
  }

  async function createFreeProvider() {
    setCreateLoading(true)
    setCreateError('')
    setCreateSuccess('')
    try {
      const res = await fetch('/api/admin/create-provider-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...createForm, months: Number(createForm.months) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error || 'Erreur serveur')
      } else {
        setCreateSuccess(`✅ Compte créé — ${createForm.months} mois gratuits pour ${createForm.businessName}`)
        setCreateForm(EMPTY_FORM)
        loadData()
      }
    } catch {
      setCreateError('Erreur réseau')
    }
    setCreateLoading(false)
  }

  async function saveFoundingCount() {
    const val = parseInt(foundingCountInput)
    if (isNaN(val) || val < 0 || val > 100) return
    setFoundingCountSaving(true)
    await fetch('/api/admin/founding-count', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: val }),
    })
    setFoundingCount(val)
    setEditingFoundingCount(false)
    setFoundingCountSaving(false)
  }

  async function reviewAction(reviewId: string, action: string) {
    await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId, action }),
    })
    loadData()
  }

  const filtered = providers.filter(p => {
    if (filter === 'pending') return !p.isPublished
    if (filter === 'active') return p.isPublished && p.subscriptionStatus === 'active'
    if (filter === 'premium') return p.subscriptionPlan === 'premium'
    return true
  }).filter(p => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      p.businessName?.toLowerCase().includes(s) ||
      p.user?.email?.toLowerCase().includes(s) ||
      p.city?.toLowerCase().includes(s)
    )
  })

  const stats = {
    total: providers.length,
    active: providers.filter(p => p.subscriptionStatus === 'active').length,
    pending: providers.filter(p => !p.isPublished).length,
    premium: providers.filter(p => p.subscriptionPlan === 'premium').length,
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center">
            <Shield size={20} className="text-rose" />
          </div>
          <div>
            <h1 className="font-cormorant text-3xl font-bold text-white">Administration</h1>
            <p className="text-white/40 text-sm">MonPrestataire — Espace admin</p>
          </div>
        </div>
        <button
          onClick={() => { setShowCreateModal(true); setCreateError(''); setCreateSuccess('') }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose text-white text-sm font-medium hover:bg-rose/80 transition-colors shrink-0"
        >
          <UserPlus size={15} /> Créer un compte gratuit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total prestataires', value: stats.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Abonnements actifs', value: stats.active, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'En attente de validation', value: stats.pending, icon: Eye, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Formule Premium', value: stats.premium, icon: Zap, color: 'text-gold', bg: 'bg-gold/10' },
        ].map(s => (
          <div key={s.label} className="bg-dark-card border border-dark-border rounded-2xl p-4">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={16} className={s.color} />
            </div>
            <p className="font-cormorant text-3xl font-bold text-white">{s.value}</p>
            <p className="text-white/40 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Compteur fondateurs */}
      <div className="bg-gold/5 border border-gold/20 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <Zap size={20} className="text-gold shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-medium text-sm">Offre lancement — Places fondateurs</p>
              <span className="text-gold font-bold text-sm">{foundingCount}/100</span>
            </div>
            <div className="h-2 bg-dark rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full transition-all"
                style={{ width: `${foundingCount}%` }} />
            </div>
          </div>
          <span className="text-white/50 text-sm shrink-0">{100 - foundingCount} places restantes</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {editingFoundingCount ? (
            <>
              <input
                type="number"
                min={0}
                max={100}
                value={foundingCountInput}
                onChange={e => setFoundingCountInput(e.target.value)}
                className="w-20 bg-dark border border-gold/40 rounded-lg px-2 py-1 text-white text-sm text-center"
                placeholder={String(foundingCount)}
              />
              <span className="text-white/40 text-sm">places prises (sur 100)</span>
              <button onClick={saveFoundingCount} disabled={foundingCountSaving}
                className="ml-2 px-3 py-1 rounded-lg bg-gold text-dark text-xs font-semibold hover:bg-gold/80 transition-colors">
                {foundingCountSaving ? '…' : 'Enregistrer'}
              </button>
              <button onClick={() => setEditingFoundingCount(false)}
                className="px-3 py-1 rounded-lg bg-dark-card border border-dark-border text-white/40 text-xs hover:text-white transition-colors">
                Annuler
              </button>
            </>
          ) : (
            <button onClick={() => { setFoundingCountInput(String(foundingCount)); setEditingFoundingCount(true) }}
              className="text-gold/60 text-xs hover:text-gold transition-colors underline underline-offset-2">
              Modifier le compteur
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setTab('stats')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            tab === 'stats' ? 'bg-rose text-white' : 'bg-dark-card border border-dark-border text-white/60 hover:border-rose/30'
          )}>
          <BarChart2 size={14} /> Stats globales
        </button>
        <button onClick={() => setTab('providers')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            tab === 'providers' ? 'bg-rose text-white' : 'bg-dark-card border border-dark-border text-white/60 hover:border-rose/30'
          )}>
          <Users size={14} /> Prestataires ({providers.length})
        </button>
        <button onClick={() => setTab('clients')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            tab === 'clients' ? 'bg-rose text-white' : 'bg-dark-card border border-dark-border text-white/60 hover:border-rose/30'
          )}>
          <Users size={14} /> Clients ({clients.length})
        </button>
        <button onClick={() => setTab('reviews')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            tab === 'reviews' ? 'bg-rose text-white' : 'bg-dark-card border border-dark-border text-white/60 hover:border-rose/30'
          )}>
          <MessageSquare size={14} /> Avis à modérer ({reviews.length})
          {reviews.length > 0 && tab !== 'reviews' && (
            <span className="bg-rose text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{reviews.length}</span>
          )}
        </button>
        <button onClick={() => setTab('newsletter')}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
            tab === 'newsletter' ? 'bg-rose text-white' : 'bg-dark-card border border-dark-border text-white/60 hover:border-rose/30'
          )}>
          <Mail size={14} /> Newsletter ({newsletters.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : tab === 'stats' ? (
        <div className="space-y-6">
          {globalStats && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Prestataires actifs', value: globalStats.providers?.active ?? 0, sub: `${globalStats.providers?.total ?? 0} total`, color: 'text-green-400', bg: 'bg-green-400/10' },
                  { label: 'Formule Premium', value: globalStats.providers?.premium ?? 0, sub: `${globalStats.providers?.standard ?? 0} Standard`, color: 'text-gold', bg: 'bg-gold/10' },
                  { label: 'Membres fondateurs', value: globalStats.providers?.foundingMembers ?? 0, sub: `sur 100`, color: 'text-rose', bg: 'bg-rose/10' },
                  { label: 'Clients inscrits', value: globalStats.clients?.total ?? 0, sub: 'comptes CLIENT', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                ].map(s => (
                  <div key={s.label} className="bg-dark-card border border-dark-border rounded-2xl p-4">
                    <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                      <TrendingUp size={16} className={s.color} />
                    </div>
                    <p className={`font-cormorant text-3xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-white text-sm mt-0.5">{s.label}</p>
                    <p className="text-white/30 text-xs">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Avis approuvés', value: globalStats.reviews?.total ?? 0, sub: `${globalStats.reviews?.pending ?? 0} en attente` },
                  { label: 'Demandes de devis', value: globalStats.devis?.total ?? 0, sub: 'toutes periodes' },
                  { label: 'Vues cumulées', value: (globalStats.engagement?.totalViews ?? 0).toLocaleString('fr-FR'), sub: 'profils prestataires' },
                  { label: 'MRR estimé', value: `${globalStats.revenue?.estimatedMRR ?? 0} €`, sub: 'revenus mensuels estimés' },
                ].map(s => (
                  <div key={s.label} className="bg-dark-card border border-dark-border rounded-2xl p-4">
                    <p className="font-cormorant text-3xl font-bold text-white">{s.value}</p>
                    <p className="text-white text-sm mt-0.5">{s.label}</p>
                    <p className="text-white/30 text-xs">{s.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
                  <p className="text-white/40 text-xs mb-1">Nouveaux prestataires</p>
                  <p className="font-cormorant text-2xl font-bold text-white">{globalStats.providers?.newThisWeek ?? 0} cette semaine</p>
                  <p className="text-white/40 text-xs mt-1">{globalStats.providers?.newThisMonth ?? 0} ce mois</p>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
                  <p className="text-white/40 text-xs mb-1">Newsletter</p>
                  <p className="font-cormorant text-2xl font-bold text-white">{globalStats.newsletter?.total ?? 0} inscrits</p>
                  <p className="text-white/40 text-xs mt-1">emails collectés</p>
                </div>
              </div>
            </>
          )}
        </div>
      ) : tab === 'providers' ? (
        <>
          {/* Recherche prestataires */}
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom, email ou ville…"
              className="w-full bg-dark border border-dark-border rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-rose/40"
            />
          </div>

          {/* Filtres prestataires + export */}
          <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
            {(['all', 'pending', 'active', 'premium'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-colors border whitespace-nowrap',
                  filter === f ? 'bg-rose border-rose text-white' : 'border-dark-border text-white/60 hover:border-rose/30'
                )}>
                {f === 'all' ? `Tous (${providers.length})` : f === 'pending' ? `En attente (${stats.pending})` : f === 'active' ? `Actifs (${stats.active})` : `Premium (${stats.premium})`}
              </button>
            ))}
          </div>
          <button onClick={exportProvidersCsv}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold text-xs font-medium transition-colors border border-gold/20 whitespace-nowrap shrink-0">
            <Download size={13} /> Export CSV
          </button>
          </div>

          <div className="space-y-3">
            {filtered.map(p => (
              <div key={p.id} className="bg-dark-card border border-dark-border rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-dark shrink-0">
                      {p.profilePhoto ? (
                        <Image src={p.profilePhoto} alt={p.businessName} width={40} height={40} className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-rose to-gold flex items-center justify-center text-white font-bold text-sm">
                          {p.businessName?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate">{p.businessName}</p>
                      <p className="text-white/40 text-xs truncate">{p.user?.email} · {p.city}, {p.region}</p>
                      <p className="text-white/30 text-xs">
                        {p._count?.reviews || 0} avis · {p._count?.favorites || 0} favoris
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    <span className={cn('text-xs px-2 py-1 rounded-full font-medium capitalize',
                      p.subscriptionStatus === 'active' ? 'bg-green-500/10 text-green-400' :
                      p.subscriptionStatus === 'trialing' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-dark text-white/40'
                    )}>
                      {p.subscriptionPlan || 'Aucun'} · {p.subscriptionStatus || 'inactif'}
                    </span>
                    <span className={cn('text-xs px-2 py-1 rounded-full',
                      p.isPublished ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'
                    )}>
                      {p.isPublished ? '🟢 Publié' : '⏳ Non publié'}
                    </span>
                    {p.isVerified && <span className="text-xs px-2 py-1 rounded-full bg-rose/10 text-rose">✅ Vérifié</span>}
                    {!p.isVerified && p.verificationRequested && <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400">🔍 Vérif. demandée</span>}
                    {p.isFoundingMember && <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold">⚡ Fondateur</span>}
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    {!p.isVerified && (
                      <button onClick={() => providerAction(p.id, 'verify')} title="Marquer comme vérifié"
                        className="w-8 h-8 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 flex items-center justify-center transition-colors">
                        <CheckCircle size={15} />
                      </button>
                    )}
                    {!p.isPublished ? (
                      <button onClick={() => providerAction(p.id, 'publish')} title="Publier le profil"
                        className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 flex items-center justify-center transition-colors">
                        <Eye size={15} />
                      </button>
                    ) : (
                      <button onClick={() => providerAction(p.id, 'unpublish')} title="Masquer le profil"
                        className="w-8 h-8 rounded-lg bg-dark hover:bg-dark text-white/40 flex items-center justify-center transition-colors">
                        <EyeOff size={15} />
                      </button>
                    )}
                    <button onClick={() => providerAction(p.id, 'reject')} title="Refuser / Désactiver"
                      className="w-8 h-8 rounded-lg bg-rose/10 hover:bg-rose/20 text-rose flex items-center justify-center transition-colors">
                      <XCircle size={15} />
                    </button>
                    <a href={`/prestataire/${p.slug}`} target="_blank" title="Voir le profil public"
                      className="w-8 h-8 rounded-lg bg-dark hover:bg-dark text-white/40 flex items-center justify-center transition-colors">
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => { if (confirm(`Supprimer définitivement "${p.businessName}" et son compte ? Cette action est irréversible.`)) providerAction(p.id, 'delete') }}
                      title="Supprimer définitivement"
                      className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-10 text-white/30 text-sm">
                Aucun prestataire dans cette catégorie.
              </div>
            )}
          </div>
        </>
      ) : tab === 'clients' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/50 text-sm">{clients.length} clients inscrits</p>
            <button
              onClick={() => {
                const header = 'Nom;Email;Demandes;Date inscription\n'
                const rows = clients.map((c: any) => [c.name, c.email, c._count?.clientRequests || 0, new Date(c.createdAt).toLocaleDateString('fr-FR')].join(';')).join('\n')
                const blob = new Blob(['﻿' + header + rows], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a'); a.href = url; a.download = 'clients.csv'; a.click()
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-card border border-dark-border text-white/60 text-sm hover:border-rose/30 transition-colors"
            >
              <Download size={13} /> Exporter CSV
            </button>
          </div>
          {clients.map((c: any) => (
            <div key={c.id} className="bg-dark-card border border-dark-border rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-400/10 flex items-center justify-center text-blue-400 font-bold text-sm">
                  {c.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{c.name}</p>
                  <p className="text-white/40 text-xs">{c.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-white text-sm font-medium">{c._count?.clientRequests || 0}</p>
                  <p className="text-white/40 text-xs">demandes</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</p>
                  <p className="text-white/40 text-xs">inscription</p>
                </div>
              </div>
            </div>
          ))}
          {clients.length === 0 && (
            <div className="text-center py-12 text-white/30">Aucun client inscrit</div>
          )}
        </div>
      ) : tab === 'reviews' ? (
        /* Avis à modérer */
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="text-center py-10 text-white/30 text-sm">
              ✅ Aucun avis en attente de modération.
            </div>
          ) : reviews.map((r: any) => (
            <div key={r.id} className="bg-dark-card border border-dark-border rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-medium text-sm">{r.user?.name || r.user?.email}</p>
                    <span className="text-white/30 text-xs">→</span>
                    <a href={`/prestataire/${r.provider?.slug}`} className="text-rose text-xs hover:underline">
                      {r.provider?.businessName}
                    </a>
                    <div className="flex ml-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={11} className={i < r.rating ? 'text-gold fill-gold' : 'text-white-border'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">{r.comment}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => reviewAction(r.id, 'approve')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-medium transition-colors">
                    <CheckCircle size={13} /> Approuver
                  </button>
                  <button onClick={() => reviewAction(r.id, 'reject')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose/10 hover:bg-rose/20 text-rose text-xs font-medium transition-colors">
                    <XCircle size={13} /> Refuser
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Newsletter */
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/50 text-sm">{newsletters.length} abonné{newsletters.length > 1 ? 's' : ''}</p>
            {newsletters.length > 0 && (
              <button onClick={exportCsv}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold text-xs font-medium transition-colors border border-gold/20">
                <Download size={13} /> Exporter CSV
              </button>
            )}
          </div>
          {newsletters.length === 0 ? (
            <div className="text-center py-10 text-white/30 text-sm">Aucun abonné pour le moment.</div>
          ) : (
            <div className="bg-dark-card border border-dark-border rounded-2xl divide-y divide-dark-border overflow-hidden">
              {newsletters.map((email, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <Mail size={13} className="text-white/30 shrink-0" />
                  <span className="text-white/70 text-sm">{email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Modal création compte gratuit */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cormorant text-2xl font-bold text-white">Créer un compte prestataire gratuit</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Prénom Nom *</label>
                  <input
                    value={createForm.name}
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                    className="input-dark text-sm"
                    placeholder="Sophie Martin"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Email *</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                    className="input-dark text-sm"
                    placeholder="sophie@email.fr"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1 block">Mot de passe provisoire *</label>
                <input
                  value={createForm.password}
                  onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                  className="input-dark text-sm"
                  placeholder="Au moins 6 caractères"
                />
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1 block">Nom du business *</label>
                <input
                  value={createForm.businessName}
                  onChange={e => setCreateForm(f => ({ ...f, businessName: e.target.value }))}
                  className="input-dark text-sm"
                  placeholder="Sophie Maquillage Paris"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Ville *</label>
                  <input
                    value={createForm.city}
                    onChange={e => setCreateForm(f => ({ ...f, city: e.target.value }))}
                    className="input-dark text-sm"
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Région *</label>
                  <input
                    value={createForm.region}
                    onChange={e => setCreateForm(f => ({ ...f, region: e.target.value }))}
                    className="input-dark text-sm"
                    placeholder="Île-de-France"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1 block">Durée gratuite</label>
                <div className="flex gap-2">
                  {(['3', '6', '12'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setCreateForm(f => ({ ...f, months: m }))}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium border transition-colors',
                        createForm.months === m
                          ? 'bg-rose border-rose text-white'
                          : 'border-dark-border text-white/50 hover:border-rose/30'
                      )}
                    >
                      {m} mois
                    </button>
                  ))}
                </div>
              </div>

              {createError && <p className="text-rose text-sm">{createError}</p>}
              {createSuccess && <p className="text-green-400 text-sm">{createSuccess}</p>}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-dark-border text-white/50 text-sm hover:border-rose/30 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={createFreeProvider}
                disabled={createLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose text-white text-sm font-medium hover:bg-rose/80 transition-colors disabled:opacity-50"
              >
                {createLoading ? 'Création…' : `Créer — ${createForm.months} mois gratuits`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

