'use client'

import { useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Check, Zap, Star, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const PLANS = {
  standard: {
    name: 'Standard',
    icon: Star,
    monthlyPrice: 4.99,
    yearlyPrice: 49.90,
    color: 'rose',
    features: [
      'Profil complet visible',
      '20 photos dans la galerie',
      'Avis clients',
      'Apparition dans les résultats',
      'Galerie Instagram connectée',
      'Numéro de téléphone visible',
      'Informations de livraison',
    ],
    note: 'Sans engagement · Résiliable à tout moment',
  },
  premium: {
    name: 'Premium',
    icon: Crown,
    monthlyPrice: 9.99,
    yearlyPrice: 99.90,
    color: 'gold',
    features: [
      'Tout ce qui est inclus dans Standard',
      'Affiché en haut des résultats',
      'Badge "Prestataire vérifié" prioritaire',
      'Vidéo de présentation',
      'Galerie jusqu\'à 50 photos',
      'Statistiques avancées du tableau de bord',
      'Mis en avant sur la page d\'accueil',
    ],
    note: 'Sans engagement · Résiliable à tout moment',
    recommended: true,
  },
}

function AbonnementContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const isNew = searchParams.get('new') === 'true'
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState<string | null>(null)

  async function subscribe(planKey: string) {
    if (!session) { window.location.href = '/connexion'; return }
    setLoading(planKey)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {isNew && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-8 text-center text-green-400 text-sm">
            ✅ Profil créé avec succès ! Choisissez maintenant votre formule pour le mettre en ligne.
          </div>
        )}

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-2 mb-4 text-sm text-gold">
            <Zap size={14} />
            Offre lancement : 6 mois offerts pour les 100 premiers
          </div>
          <h1 className="font-cormorant text-4xl sm:text-5xl font-bold text-white mb-3">
            Choisissez votre <span className="text-gradient-rose-gold">formule</span>
          </h1>
          <p className="text-white/50 max-w-xl mx-auto text-sm">
            Publiez votre profil et commencez à recevoir des clients. Aucun frais caché.
          </p>

          {/* Toggle mensuel / annuel */}
          <div className="inline-flex items-center gap-3 bg-dark-card border border-dark-border rounded-xl p-1 mt-6">
            <button
              onClick={() => setBilling('monthly')}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', billing === 'monthly' ? 'bg-rose text-white' : 'text-white/50 hover:text-white')}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2', billing === 'yearly' ? 'bg-rose text-white' : 'text-white/50 hover:text-white')}
            >
              Annuel <span className="text-xs bg-gold text-white rounded-full px-2 py-0.5 font-bold">-2 mois</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Object.entries(PLANS) as [string, typeof PLANS.standard & { recommended?: boolean }][]).map(([key, plan]) => {
            const price = billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
            const planKey = `${key}_${billing === 'yearly' ? 'yearly' : 'monthly'}`
            const Icon = plan.icon

            return (
              <div
                key={key}
                className={cn(
                  'rounded-2xl border p-6 sm:p-8 relative',
                  plan.recommended
                    ? 'border-gold/40 bg-gradient-to-b from-gold/5 to-dark-card'
                    : 'border-dark-border bg-dark-card'
                )}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold to-yellow-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    ✨ Recommandé
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', plan.recommended ? 'bg-gold/20' : 'bg-rose/10')}>
                    <Icon size={18} className={plan.recommended ? 'text-gold' : 'text-rose'} />
                  </div>
                  <h2 className="font-cormorant text-2xl font-bold text-white">{plan.name}</h2>
                </div>

                <div className="mb-6">
                  <span className={cn('text-4xl font-bold font-cormorant', plan.recommended ? 'text-gold' : 'text-white')}>
                    {price.toFixed(2).replace('.', ',')}€
                  </span>
                  <span className="text-white/40 text-sm">/{billing === 'yearly' ? 'an' : 'mois'}</span>
                  {billing === 'yearly' && (
                    <p className="text-white/30 text-xs mt-1">
                      soit {(price / 10).toFixed(2).replace('.', ',')}€/mois · 2 mois offerts
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                      <Check size={15} className={plan.recommended ? 'text-gold shrink-0 mt-0.5' : 'text-rose shrink-0 mt-0.5'} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => subscribe(planKey)}
                  disabled={!!loading}
                  className={cn(
                    'w-full py-3 rounded-xl font-medium text-sm transition-all',
                    plan.recommended
                      ? 'bg-gradient-to-r from-gold to-yellow-600 hover:from-gold-dark hover:to-yellow-700 text-white'
                      : 'btn-primary'
                  )}
                >
                  {loading === planKey ? 'Redirection…' : `Choisir ${plan.name}`}
                </button>

                <p className="text-white/25 text-xs mt-3 leading-relaxed">{plan.note}</p>
              </div>
            )
          })}
        </div>

        {/* Mention légale */}
        <p className="text-center text-white/20 text-xs mt-8 max-w-xl mx-auto leading-relaxed">
          L&apos;abonnement MonPrestataire donne accès à une visibilité sur la plateforme et ne constitue pas une garantie de ventes ou de mise en relation.
        </p>

        {/* FAQ rapide */}
        <div className="mt-8 bg-dark-card border border-dark-border rounded-2xl p-6">
          <h2 className="font-cormorant text-2xl font-semibold text-white mb-4">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              { q: 'Puis-je résilier à tout moment ?', a: 'Oui, vous pouvez résilier à tout moment depuis votre tableau de bord, sans engagement ni préavis. L\'abonnement annuel n\'est pas remboursable.' },
              { q: 'Comment fonctionne l\'offre lancement ?', a: 'Les 100 premiers prestataires bénéficient de 6 mois gratuits avant l\'activation de leur abonnement choisi. Le coupon est appliqué automatiquement lors du paiement.' },
              { q: 'Mon profil est-il visible immédiatement ?', a: 'Votre profil est soumis à validation par l\'équipe MonPrestataire avant publication. Ce processus dure généralement moins de 24h.' },
              { q: 'Puis-je changer de formule ?', a: 'Oui, vous pouvez passer de Standard à Premium à tout moment depuis votre tableau de bord.' },
            ].map(item => (
              <div key={item.q} className="border-b border-dark-border pb-4 last:border-0 last:pb-0">
                <p className="text-white font-medium text-sm mb-1">{item.q}</p>
                <p className="text-white/40 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AbonnementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AbonnementContent />
    </Suspense>
  )
}

