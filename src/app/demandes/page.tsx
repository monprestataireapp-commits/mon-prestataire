'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { MapPin, Calendar, Euro, MessageSquare, Plus, X, Send } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

function DemandesContent() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [responding, setResponding] = useState<string | null>(null)
  const [responseMsg, setResponseMsg] = useState('')
  const [responsePrice, setResponsePrice] = useState('')

  const isProvider = (session?.user as any)?.role === 'PROVIDER'

  const [form, setForm] = useState({
    title: '', description: '', categoryId: '', city: '', region: '', budget: '', eventDate: '',
  })

  async function loadRequests() {
    const data = await fetch('/api/requests').then(r => r.json())
    setRequests(data.requests || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { loadRequests() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setDone(true)
      setShowForm(false)
      setForm({ title: '', description: '', categoryId: '', city: '', region: '', budget: '', eventDate: '' })
      loadRequests()
    } finally {
      setSubmitting(false)
    }
  }

  async function respond(requestId: string) {
    if (!responseMsg.trim()) return
    await fetch(`/api/requests/${requestId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: responseMsg, price: responsePrice }),
    })
    setResponding(null)
    setResponseMsg('')
    setResponsePrice('')
    loadRequests()
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-bold text-white mb-1">
            Demandes <span className="text-gradient-rose-gold">clients</span>
          </h1>
          <p className="text-white/40 text-sm">{total} demande{total > 1 ? 's' : ''} en ligne</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className={cn('flex items-center gap-2 text-sm', showForm ? 'btn-secondary' : 'btn-primary')}>
          {showForm ? <><X size={15} /> Annuler</> : <><Plus size={15} /> Publier une demande</>}
        </button>
      </div>

      {done && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6 text-green-400 text-sm text-center">
          ✅ Votre demande a été publiée ! Les prestataires concernés peuvent désormais y répondre.
        </div>
      )}

      {/* Formulaire de demande */}
      {showForm && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-8">
          <h2 className="font-cormorant text-2xl font-semibold text-white mb-4">Publier une demande</h2>
          <p className="text-white/40 text-sm mb-5">
            Décrivez votre besoin en détail. Les prestataires correspondants pourront vous répondre directement.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Titre de votre demande *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                className="input-dark" placeholder="Ex : Cherche maquilleuse pour mariage le 10 août à Paris" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Description détaillée *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required
                rows={4} className="input-dark resize-none"
                placeholder="Décrivez votre besoin : type de prestation, occasion, nombre de personnes, vos attentes, contraintes particulières…" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Catégorie</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="input-dark bg-dark-card">
                  <option value="">Toutes catégories</option>
                  {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Ville</label>
                <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="input-dark" placeholder="Paris, Lyon, Marseille…" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Budget maximum (€)</label>
                <input type="number" min="0" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                  className="input-dark" placeholder="150" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Date de l&apos;événement</label>
                <input type="date" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                  className="input-dark" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Publication…' : 'Publier ma demande'}
            </button>
          </form>
        </div>
      )}

      {/* Info pour les prestataires */}
      {isProvider && (
        <div className="bg-gold/5 border border-gold/20 rounded-2xl p-4 mb-6 text-sm text-gold/80">
          💡 En tant que prestataire, vous pouvez répondre aux demandes clients. Cliquez sur &ldquo;Répondre&rdquo; pour envoyer votre offre.
        </div>
      )}

      {/* Liste des demandes */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-cormorant text-2xl text-white mb-2">Aucune demande pour le moment</p>
          <p className="text-white/40 text-sm mb-6">Soyez le premier à publier une demande !</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Publier une demande
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden hover:border-rose/20 transition-colors">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-cormorant text-xl font-semibold text-white mb-1">{req.title}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-white/40">
                      {req.city && <span className="flex items-center gap-1"><MapPin size={11} /> {req.city}{req.region ? `, ${req.region}` : ''}</span>}
                      {req.budget && <span className="flex items-center gap-1"><Euro size={11} /> Budget : {req.budget}€ max</span>}
                      {req.eventDate && <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(req.eventDate)}</span>}
                      <span className="text-white/20">Publié le {formatDate(req.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/30 text-xs shrink-0">
                    <MessageSquare size={13} />
                    <span>{req._count?.responses || 0} réponse{(req._count?.responses || 0) > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <p className="text-white/60 text-sm leading-relaxed">{req.description}</p>

                {/* Bouton répondre (prestataire uniquement) */}
                {isProvider && (
                  <div className="mt-4">
                    {responding === req.id ? (
                      <div className="space-y-3">
                        <textarea value={responseMsg} onChange={e => setResponseMsg(e.target.value)} rows={3}
                          className="input-dark text-sm resize-none"
                          placeholder="Votre message au client : décrivez votre offre, votre disponibilité, votre tarif…" />
                        <div className="flex gap-3">
                          <input type="number" min="0" value={responsePrice} onChange={e => setResponsePrice(e.target.value)}
                            className="input-dark text-sm w-32" placeholder="Tarif (€)" />
                          <button onClick={() => respond(req.id)} disabled={!responseMsg.trim()}
                            className="btn-primary text-sm py-2 flex items-center gap-1 flex-1">
                            <Send size={14} /> Envoyer ma réponse
                          </button>
                          <button onClick={() => setResponding(null)} className="btn-secondary text-sm py-2 px-3">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setResponding(req.id)}
                        className="btn-secondary text-sm py-1.5 px-4 flex items-center gap-1">
                        <MessageSquare size={13} /> Répondre à cette demande
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DemandesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <DemandesContent />
    </Suspense>
  )
}

