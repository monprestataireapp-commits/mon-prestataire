'use client'

import { useState } from 'react'
import { ProviderCard } from '@/components/provider/ProviderCard'
import Link from 'next/link'
import { X } from 'lucide-react'

type Provider = {
  id: string
  slug: string
  businessName: string
  description: string
  city: string
  region: string
  profilePhoto?: string | null
  subscriptionPlan?: string | null
  isVerified: boolean
  hasDelivery: boolean
  isAvailableToday: boolean
  priceMin?: number | null
  priceMax?: number | null
  avgRating?: number | null
  reviewCount?: number
  favoritesCount?: number
  specialties: string[]
  photos?: { url: string }[]
  categories?: { category: { name: string; slug: string; emoji: string } }[]
}

interface Props {
  providers: Provider[]
  specialties: string[]
  cat: { slug: string; name: string; emoji: string }
}

export function CategoryPageClient({ providers, specialties, cat }: Props) {
  const [selected, setSelected] = useState<string[]>([])

  function toggle(sp: string) {
    setSelected(prev =>
      prev.includes(sp) ? prev.filter(s => s !== sp) : [...prev, sp]
    )
  }

  const filtered = selected.length === 0
    ? providers
    : providers.filter(p => selected.every(sp => p.specialties.includes(sp)))

  return (
    <div>
      {/* Filtres spécialités */}
      {specialties.length > 0 && (
        <div className="mb-6">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Par spécialité</p>
          <div className="flex flex-wrap gap-2">
            {specialties.map(sp => (
              <button
                key={sp}
                onClick={() => toggle(sp)}
                className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                  selected.includes(sp)
                    ? 'bg-rose border-rose text-white'
                    : 'border-dark-border text-white/50 hover:border-rose/40 hover:text-white'
                }`}
              >
                {sp}
                {selected.includes(sp) && <X size={12} className="inline ml-1.5 -mt-0.5" />}
              </button>
            ))}
            {selected.length > 0 && (
              <button
                onClick={() => setSelected([])}
                className="px-3 py-1.5 rounded-full border border-dark-border text-white/30 hover:text-white text-sm transition-colors"
              >
                Tout effacer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Compteur */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-white/50 text-sm">
          <span className="text-white font-medium">{filtered.length}</span> prestataire{filtered.length > 1 ? 's' : ''}
          {selected.length > 0 && <span className="text-rose"> · {selected.join(', ')}</span>}
        </p>
        <Link href={`/recherche?category=${cat.slug}`} className="text-rose text-sm hover:underline">
          Filtres avancés
        </Link>
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">{cat.emoji}</p>
          <h2 className="font-cormorant text-2xl text-white mb-2">Aucun prestataire pour cette spécialité</h2>
          <p className="text-white/40 text-sm mb-4">Essayez une autre spécialité ou supprimez les filtres.</p>
          <button onClick={() => setSelected([])} className="btn-secondary text-sm">
            Voir tous les prestataires
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => <ProviderCard key={p.id} provider={p} />)}
        </div>
      )}
    </div>
  )
}
