'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, Heart, CheckCircle, Truck } from 'lucide-react'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { getPhotoUrl } from '@/lib/photo'

interface ProviderCardProps {
  provider: {
    id: string
    slug: string
    businessName: string
    description: string
    city: string
    region: string
    profilePhoto?: string | null
    subscriptionPlan?: string | null
    isVerified: boolean
    isAvailableToday: boolean
    avgRating?: number | null
    reviewCount?: number
    favoritesCount?: number
    hasDelivery?: boolean
    priceMin?: number | null
    priceMax?: number | null
    categories?: { category: { name: string; emoji: string } }[]
    photos?: { url: string }[]
  }
  isFavorited?: boolean
}

export function ProviderCard({ provider, isFavorited = false }: ProviderCardProps) {
  const { data: session } = useSession()
  const [favorited, setFavorited] = useState(isFavorited)
  const [loading, setLoading] = useState(false)

  const isPremium = provider.subscriptionPlan === 'premium'
  const photo = getPhotoUrl(provider.profilePhoto || provider.photos?.[0]?.url)

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    if (!session) { window.location.href = '/connexion'; return }
    setLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: provider.id }),
      })
      const data = await res.json()
      setFavorited(data.favorited)
    } finally {
      setLoading(false)
    }
  }

  function trackClick() {
    fetch(`/api/providers/${provider.slug}/click`, { method: 'POST' }).catch(() => {})
  }

  return (
    <Link href={`/prestataire/${provider.slug}`} className="block group" onClick={trackClick}>
      <div className={cn(
        'bg-dark-card rounded-2xl overflow-hidden card-hover border border-dark-border',
        isPremium && 'border-gold/20'
      )}>
        {/* Photo */}
        <div className="relative h-52 sm:h-56 overflow-hidden">
          <Image
            src={photo}
            alt={provider.businessName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />

          {/* Badges top */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {isPremium && (
              <span className="badge-premium">★ Premium</span>
            )}
            {provider.isVerified && (
              <span className="badge-verified">
                <CheckCircle size={11} /> Vérifié
              </span>
            )}
          </div>

          {/* Favoris */}
          <button
            onClick={toggleFavorite}
            disabled={loading}
            className={cn(
              'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all',
              favorited ? 'bg-rose text-white' : 'bg-dark/60 text-white/70 hover:bg-rose/20 hover:text-rose'
            )}
          >
            <Heart size={15} fill={favorited ? 'currentColor' : 'none'} />
          </button>

          {/* Disponibilité */}
          {provider.isAvailableToday && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-dark/70 backdrop-blur-sm rounded-full px-2.5 py-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white">Disponible aujourd&apos;hui</span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-cormorant text-lg font-semibold text-white leading-tight line-clamp-1">
              {provider.businessName}
            </h3>
            {provider.avgRating && (
              <div className="flex items-center gap-1 shrink-0">
                <Star size={13} className="text-gold fill-gold" />
                <span className="text-sm font-medium text-white">{provider.avgRating}</span>
                <span className="text-xs text-white/40">({provider.reviewCount})</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-white/50 text-xs mb-2">
            <MapPin size={11} />
            <span>{provider.city}, {provider.region}</span>
          </div>

          {provider.categories && provider.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {provider.categories.slice(0, 2).map(c => (
                <span key={c.category.name} className="text-xs bg-dark border border-dark-border text-white/60 rounded-full px-2 py-0.5">
                  {c.category.emoji} {c.category.name}
                </span>
              ))}
            </div>
          )}

          <p className="text-white/50 text-xs line-clamp-2 leading-relaxed">
            {provider.description}
          </p>

          <div className="mt-2 flex items-center justify-between">
            {provider.priceMin && (
              <span className="text-xs text-gold font-medium">
                À partir de {provider.priceMin}€
                {provider.priceMax ? ` — ${provider.priceMax}€` : ''}
              </span>
            )}
            {provider.hasDelivery && (
              <div className="flex items-center gap-1 text-xs text-white/40 ml-auto">
                <Truck size={11} />
                <span>Livraison</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

