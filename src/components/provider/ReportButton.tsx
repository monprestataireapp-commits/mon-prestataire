'use client'

import { useState } from 'react'
import { Flag, X, Send } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

const REASONS = [
  { value: 'fake', label: 'Faux profil / escroquerie' },
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'spam', label: 'Spam ou publicité abusive' },
  { value: 'other', label: 'Autre motif' },
]

export function ReportButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) return
    setLoading(true)
    try {
      const res = await fetch(`/api/providers/${slug}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details }),
      })
      if (res.ok) {
        setDone(true)
        toast('Signalement envoyé, merci.', 'success')
        setTimeout(() => setOpen(false), 2000)
      } else {
        const d = await res.json()
        toast(d.error || 'Erreur', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="text-white/20 hover:text-white/40 text-xs flex items-center gap-1 transition-colors ml-auto">
        <Flag size={11} /> Signaler ce profil
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-dark/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-dark-card border border-dark-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cormorant text-lg font-bold text-white flex items-center gap-2">
                <Flag size={16} className="text-rose" /> Signaler ce profil
              </h3>
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {done ? (
              <p className="text-green-400 text-sm py-4 text-center">✅ Signalement envoyé. Notre équipe va examiner ce profil.</p>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 mb-2 block">Motif du signalement</label>
                  <div className="space-y-2">
                    {REASONS.map(r => (
                      <label key={r.value} className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="reason" value={r.value} checked={reason === r.value}
                          onChange={() => setReason(r.value)} className="accent-rose" />
                        <span className="text-white/70 text-sm group-hover:text-white transition-colors">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Détails (optionnel)</label>
                  <textarea
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    rows={3}
                    maxLength={300}
                    placeholder="Décrivez le problème…"
                    className="w-full bg-dark border border-dark-border rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-rose/40 resize-none"
                  />
                </div>
                <button type="submit" disabled={!reason || loading}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Send size={14} /> {loading ? 'Envoi…' : 'Envoyer le signalement'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

