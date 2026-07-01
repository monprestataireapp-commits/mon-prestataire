import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Star, MapPin, Phone, CheckCircle, Truck, ArrowLeft, Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { FavoriteButton } from '@/components/provider/FavoriteButton'
import { ReviewForm } from '@/components/provider/ReviewForm'
import { PhotoLightbox } from '@/components/provider/PhotoLightbox'
import { ShareButton } from '@/components/provider/ShareButton'
import { ViewTracker } from '@/components/provider/ViewTracker'
import { getPhotoUrl } from '@/lib/photo'
import { ReportButton } from '@/components/provider/ReportButton'
import { DevisButton } from '@/components/provider/DevisButton'

export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const provider = await prisma.provider.findUnique({
    where: { slug: params.slug },
    select: { businessName: true, description: true, profilePhoto: true, city: true, region: true, categories: { include: { category: true }, take: 3 } },
  })
  if (!provider) return {}
  const cats = provider.categories.map(c => c.category.name).join(', ')
  return {
    title: `${provider.businessName} — ${cats} à ${provider.city}`,
    description: provider.description?.slice(0, 160) || `Profil prestataire de ${provider.businessName} à ${provider.city}, ${provider.region}.`,
    openGraph: {
      title: `${provider.businessName} — ${cats} à ${provider.city}`,
      description: provider.description?.slice(0, 160) || '',
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: provider.businessName,
      description: provider.description?.slice(0, 160) || '',
    },
  }
}

async function getProvider(slug: string) {
  return prisma.provider.findUnique({
    where: { slug },
    include: {
      categories: { include: { category: true } },
      photos: { orderBy: { sortOrder: 'asc' } },
      videos: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true, rating: true, comment: true, reply: true, repliedAt: true, createdAt: true,
          user: { select: { name: true } },
        },
      },
      _count: { select: { favorites: true, reviews: true } },
    },
  })
}

export default async function ProviderPage({ params }: Props) {
  const provider = await getProvider(params.slug)
  if (!provider || !provider.isPublished) notFound()

  const avgRating = provider.reviews.length
    ? Math.round(provider.reviews.reduce((s, r) => s + r.rating, 0) / provider.reviews.length * 10) / 10
    : null
  const isPremium = provider.subscriptionPlan === 'premium'
  const isStandardOrHigher = provider.subscriptionPlan === 'standard' || isPremium

  const baseUrl = process.env.NEXTAUTH_URL || 'https://mon-prestataire.fr'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: provider.businessName,
    description: provider.description || undefined,
    url: `${baseUrl}/prestataire/${provider.slug}`,
    image: provider.profilePhoto || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: provider.city,
      addressRegion: provider.region,
      addressCountry: 'FR',
    },
    ...(avgRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: provider._count.reviews,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(provider.priceMin && {
      priceRange: provider.priceMax ? `${provider.priceMin}€–${provider.priceMax}€` : `À partir de ${provider.priceMin}€`,
    }),
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker slug={provider.slug} />
      {/* Back */}
      <Link href="/recherche" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={15} /> Retour aux résultats
      </Link>

      {/* Header profil */}
      <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden mb-6">
        {/* Cover */}
        <div className="relative h-48 sm:h-64">
          <Image
            src={getPhotoUrl(provider.coverPhoto || provider.photos[0]?.url || provider.profilePhoto, 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80')}
            alt={provider.businessName}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-dark-card/20 to-transparent" />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + infos */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 relative">
            <div className="w-24 h-24 rounded-2xl border-4 border-dark-card overflow-hidden shrink-0 bg-dark">
              {provider.profilePhoto ? (
                <Image src={getPhotoUrl(provider.profilePhoto)} alt={provider.businessName} width={96} height={96} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-rose to-gold flex items-center justify-center text-3xl text-white font-bold font-cormorant">
                  {provider.businessName[0]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pt-4 sm:pt-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {isPremium && <span className="badge-premium">★ Premium</span>}
                {provider.isVerified && (
                  <span className="badge-verified">
                    <CheckCircle size={11} /> Vérifié
                  </span>
                )}
              </div>
              <h1 className="font-cormorant text-3xl sm:text-4xl font-bold text-white">{provider.businessName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-white/50 text-sm">
                  <MapPin size={13} /> {provider.city}, {provider.department}, {provider.region}
                </span>
                {avgRating && (
                  <span className="flex items-center gap-1 text-sm">
                    <Star size={13} className="text-gold fill-gold" />
                    <span className="text-white font-medium">{avgRating}</span>
                    <span className="text-white/40">({provider._count.reviews} avis)</span>
                  </span>
                )}
                {provider.isAvailableToday && (
                  <span className="flex items-center gap-1.5 text-sm text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Disponible aujourd&apos;hui
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-2 sm:mt-0 flex-wrap">
              <DevisButton providerId={provider.id} providerName={provider.businessName} />
              <ShareButton businessName={provider.businessName} />
              <FavoriteButton providerId={provider.id} />
            </div>
          </div>

          {/* Catégories */}
          <div className="flex flex-wrap gap-2 mt-5">
            {provider.categories.map(c => (
              <Link
                key={c.categoryId}
                href={`/recherche?category=${c.category.slug}`}
                className="flex items-center gap-1.5 text-sm bg-dark border border-dark-border text-white/60 rounded-full px-3 py-1 hover:border-rose/30 hover:text-rose transition-colors"
              >
                <span>{c.category.emoji}</span>
                <span>{c.category.name}</span>
              </Link>
            ))}
          </div>

          {/* Métas rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {provider.yearsExperience && (
              <div className="bg-dark rounded-xl p-3 text-center">
                <p className="font-cormorant text-2xl font-bold text-white">{provider.yearsExperience}</p>
                <p className="text-white/40 text-xs">ans d&apos;expérience</p>
              </div>
            )}
            {provider._count.favorites > 0 && (
              <div className="bg-dark rounded-xl p-3 text-center">
                <p className="font-cormorant text-2xl font-bold text-white">{provider._count.favorites}</p>
                <p className="text-white/40 text-xs">favoris</p>
              </div>
            )}
            {provider.responseTime && (
              <div className="bg-dark rounded-xl p-3 text-center">
                <p className="text-white text-sm font-medium">{provider.responseTime}</p>
                <p className="text-white/40 text-xs">temps de réponse</p>
              </div>
            )}
            {provider.priceMin && (
              <div className="bg-dark rounded-xl p-3 text-center">
                <p className="font-cormorant text-2xl font-bold text-gold">
                  {provider.priceMin}€{provider.priceMax ? `–${provider.priceMax}€` : '+'}
                </p>
                <p className="text-white/40 text-xs">tarifs indicatifs</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <h2 className="font-cormorant text-xl font-semibold text-white mb-3">À propos</h2>
            <p className="text-white/70 leading-relaxed text-sm whitespace-pre-line">{provider.description}</p>

            {/* Spécialités */}
            {(() => {
              const specs: string[] = (() => { try { return JSON.parse((provider as any).specialties || '[]') } catch { return [] } })()
              if (specs.length === 0) return null
              return (
                <div className="mt-4 pt-4 border-t border-dark-border">
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Spécialités</p>
                  <div className="flex flex-wrap gap-2">
                    {specs.map((sp: string) => (
                      <span key={sp} className="bg-rose/10 text-rose text-xs px-3 py-1 rounded-full border border-rose/20">
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Vidéos */}
          {provider.videos.length > 0 && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h2 className="font-cormorant text-xl font-semibold text-white mb-4">
                Vidéos ({provider.videos.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {provider.videos.map(v => (
                  <div key={v.id} className="rounded-xl overflow-hidden bg-dark border border-dark-border">
                    <video src={getPhotoUrl(v.url)} controls className="w-full aspect-video object-cover" preload="metadata" />
                    {v.caption && <p className="text-white/50 text-xs px-3 py-2">{v.caption}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Galerie photos */}
          {provider.photos.length > 0 && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
              <h2 className="font-cormorant text-xl font-semibold text-white mb-4">
                Galerie ({provider.photos.length} photo{provider.photos.length > 1 ? 's' : ''})
              </h2>
              <PhotoLightbox photos={provider.photos.slice(0, isPremium ? 50 : 20)} businessName={provider.businessName} />
            </div>
          )}

          {/* Avis */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-cormorant text-xl font-semibold text-white">
                Avis clients {avgRating && <span className="text-gold">★ {avgRating}</span>}
              </h2>
              <span className="text-white/40 text-sm">{provider._count.reviews} avis</span>
            </div>

            {provider.reviews.length === 0 ? (
              <p className="text-white/30 text-sm">Aucun avis pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {provider.reviews.map(review => (
                  <div key={review.id} className="border-b border-dark-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose to-gold flex items-center justify-center text-xs text-white font-bold">
                          {review.user.name?.[0] || 'A'}
                        </div>
                        <span className="text-white text-sm font-medium">{review.user.name || 'Client anonyme'}</span>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? 'text-gold fill-gold' : 'text-white-border'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{review.comment}</p>
                    {(review as any).reply && (
                      <div className="mt-3 ml-3 pl-3 border-l-2 border-rose/30">
                        <p className="text-white/40 text-xs mb-1 flex items-center gap-1">
                          💬 Réponse de {provider.businessName}
                        </p>
                        <p className="text-white/60 text-sm italic">{(review as any).reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-dark-border pt-6">
              <h3 className="font-cormorant text-lg text-white mb-4">Laisser un avis</h3>
              <ReviewForm providerId={provider.id} />
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-4">
          {/* Contact */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <h3 className="font-cormorant text-lg font-semibold text-white mb-4">Contact</h3>

            {isStandardOrHigher && provider.phone && (
              <a
                href={`tel:${provider.phone}`}
                className="flex items-center gap-3 bg-rose/10 border border-rose/20 rounded-xl px-4 py-3 hover:bg-rose/20 transition-colors mb-3"
              >
                <Phone size={16} className="text-rose" />
                <span className="text-white font-medium">{provider.phone}</span>
              </a>
            )}

            {provider.instagramUrl && (
              <a href={provider.instagramUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-dark border border-dark-border rounded-xl px-4 py-3 hover:border-rose/30 transition-colors mb-2">
                <span className="text-xl">📸</span>
                <span className="text-white/70 text-sm">Instagram</span>
                <ExternalLink size={12} className="text-white/30 ml-auto" />
              </a>
            )}

            {(provider as any).tiktokUrl && (
              <a href={(provider as any).tiktokUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-dark border border-dark-border rounded-xl px-4 py-3 hover:border-rose/30 transition-colors mb-2">
                <span className="text-xl">🎵</span>
                <span className="text-white/70 text-sm">TikTok</span>
                <ExternalLink size={12} className="text-white/30 ml-auto" />
              </a>
            )}

            {(provider as any).website && (
              <a href={(provider as any).website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-dark border border-dark-border rounded-xl px-4 py-3 hover:border-rose/30 transition-colors mb-2">
                <span className="text-xl">🌐</span>
                <span className="text-white/70 text-sm">Site web</span>
                <ExternalLink size={12} className="text-white/30 ml-auto" />
              </a>
            )}

            {!isStandardOrHigher && (
              <p className="text-white/30 text-xs mt-2">
                Coordonnées disponibles avec un profil Standard ou Premium.
              </p>
            )}
          </div>

          {/* Livraison */}
          {isStandardOrHigher && (provider.hasDelivery || provider.hasHandDelivery) && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <h3 className="font-cormorant text-lg font-semibold text-white mb-3">Livraison</h3>
              <div className="space-y-2 text-sm">
                {provider.hasDelivery && (
                  <>
                    <div className="flex items-center gap-2 text-white/70">
                      <Truck size={14} className="text-gold" />
                      <span>Livraison disponible</span>
                    </div>
                    {provider.deliveryZone && (
                      <div className="text-white/50 text-xs pl-5">
                        Zone : {provider.deliveryZone === 'france' ? 'France entière' : provider.deliveryZone === 'region' ? 'Région' : 'Ville uniquement'}
                      </div>
                    )}
                    {provider.deliveryFee && (
                      <div className="text-white/50 text-xs pl-5">
                        Frais : {provider.deliveryFee === 'gratuit' ? 'Gratuit' : provider.deliveryFee === 'selon_commande' ? 'Selon commande' : `À partir de ${provider.deliveryFee}€`}
                      </div>
                    )}
                  </>
                )}
                {provider.hasHandDelivery && (
                  <div className="flex items-center gap-2 text-white/70">
                    <span>🤝</span>
                    <span>Remise en main propre disponible</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Disponibilité */}
          {provider.availabilityNotes && (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <h3 className="font-cormorant text-lg font-semibold text-white mb-3">
                <Calendar size={15} className="inline mr-2 text-rose" />
                Disponibilités
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">{provider.availabilityNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lien de signalement discret */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 text-right">
        <ReportButton slug={provider.slug} />
      </div>
    </div>
  )
}
