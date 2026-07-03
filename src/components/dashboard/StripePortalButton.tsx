'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, Crown, Loader2, ArrowUpRight } from 'lucide-react'

interface Props {
  isActive: boolean
  stripeCustomerId: string | null
  isPremium: boolean
}

export function StripePortalButton({ isActive, stripeCustomerId, isPremium }: Props) {
  const [loading, setLoading] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')
  const [upgraded, setUpgraded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function openPortal() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Impossible d\'ouvrir le portail de paiement.')
      }
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  async function doUpgrade() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing }),
      })
      const data = await res.json()
      if (res.ok) {
        setUpgraded(true)
        setUpgradeOpen(false)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setError(data.error || 'Une erreur est survenue. Veuillez réessayer.')
      }
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (!isActive) {
    return (
      <Link href="/abonnement"
        className="bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-gold/30 transition-colors group flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
          <Zap size={18} className="text-gold" />
        </div>
        <div>
          <p className="text-white font-medium group-hover:text-gold transition-colors text-sm">Choisir un abonnement</p>
          <p className="text-white/40 text-xs">Plus de visibilité, 50 photos, statistiques avancées…</p>
        </div>
      </Link>
    )
  }

  return (
    <div className="space-y-3">
      {/* Gestion abonnement actuel */}
      <button onClick={openPortal} disabled={loading}
        className="bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-gold/30 transition-colors group flex items-center gap-3 w-full text-left">
        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
          {loading && !upgradeOpen
            ? <Loader2 size={18} className="text-gold animate-spin" />
            : <Zap size={18} className="text-gold" />}
        </div>
        <div className="flex-1">
          <p className="text-white font-medium group-hover:text-gold transition-colors text-sm">
            Mon abonnement {isPremium ? <span className="badge-premium ml-1">Premium</span> : '(Standard)'}
          </p>
          <p className="text-white/40 text-xs">Facturation, résiliation, moyens de paiement</p>
        </div>
        <ArrowUpRight size={14} className="text-white/20 group-hover:text-gold transition-colors" />
      </button>

      {/* Upgrade Standard → Premium */}
      {!isPremium && (
        <div className="bg-gradient-to-br from-gold/5 to-rose/5 border border-gold/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
              <Crown size={18} className="text-gold" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm mb-0.5">Passer à Premium</p>
              <p className="text-white/40 text-xs mb-3">Top des résultats · 50 photos · Vidéo · Stats avancées</p>

              {!upgradeOpen ? (
                <button onClick={() => setUpgradeOpen(true)}
                  className="bg-gradient-to-r from-gold to-yellow-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                  Passer à Premium →
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBilling('yearly')}
                      className={`flex-1 text-xs font-medium py-2 rounded-lg border transition-all ${billing === 'yearly' ? 'bg-gold border-gold text-white' : 'border-dark-border text-white/50 hover:border-gold/40'}`}>
                      Annuel <span className="text-gold font-bold">99,90 €/an</span>
                    </button>
                    <button
                      onClick={() => setBilling('monthly')}
                      className={`flex-1 text-xs font-medium py-2 rounded-lg border transition-all ${billing === 'monthly' ? 'bg-gold border-gold text-white' : 'border-dark-border text-white/50 hover:border-gold/40'}`}>
                      Mensuel <span className="font-bold">9,99 €/mois</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setUpgradeOpen(false)}
                      className="flex-1 text-xs py-2 rounded-lg border border-dark-border text-white/40 hover:text-white transition-colors">
                      Annuler
                    </button>
                    <button onClick={doUpgrade} disabled={loading}
                      className="flex-1 text-xs py-2 rounded-lg bg-gradient-to-r from-gold to-yellow-600 text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5">
                      {loading ? <Loader2 size={12} className="animate-spin" /> : null}
                      Confirmer l'upgrade
                    </button>
                  </div>
                  {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
                  <p className="text-white/30 text-xs">Prise d'effet immédiate · Prorata calculé</p>
                </div>
              )}
            </div>
          </div>
          {upgraded && (
            <p className="text-green-600 text-xs font-medium mt-2 flex items-center gap-1">
              ✓ Upgrade effectué ! Rechargement en cours…
            </p>
          )}
        </div>
      )}
    </div>
  )
}
