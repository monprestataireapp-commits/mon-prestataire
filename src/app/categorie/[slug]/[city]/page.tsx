import { prisma } from '@/lib/prisma'
import { CATEGORIES } from '@/lib/categories'
import { notFound } from 'next/navigation'
import { ProviderCard } from '@/components/provider/ProviderCard'
import { SearchBar } from '@/components/search/SearchBar'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string; city: string }
}

function decodeCity(raw: string) {
  return decodeURIComponent(raw).replace(/-/g, ' ')
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export async function generateMetadata({ params }: Props) {
  const cat = CATEGORIES.find(c => c.slug === params.slug)
  if (!cat) return {}
  const city = capitalize(decodeCity(params.city))
  return {
    title: `${cat.emoji} ${cat.name} à ${city} — MonPrestataire`,
    description: `Découvrez les meilleurs prestataires en ${cat.name.toLowerCase()} à ${city}. Profils vérifiés, avis clients, tarifs.`,
    openGraph: {
      title: `${cat.name} à ${city}`,
      description: `Trouvez votre prestataire en ${cat.name.toLowerCase()} à ${city}.`,
    },
  }
}

export default async function CategoryCityPage({ params }: Props) {
  const cat = CATEGORIES.find(c => c.slug === params.slug)
  if (!cat) notFound()

  const city = capitalize(decodeCity(params.city))

  const providers = await prisma.provider.findMany({
    where: {
      isPublished: true,
      subscriptionStatus: { in: ['active', 'trialing'] },
      categories: { some: { category: { slug: params.slug } } },
      city: { contains: city },
    },
    include: {
      categories: { include: { category: true } },
      photos: { take: 1, orderBy: { sortOrder: 'asc' } },
      reviews: { where: { isApproved: true }, select: { rating: true } },
      _count: { select: { favorites: true } },
    },
    orderBy: [{ subscriptionPlan: 'desc' }, { isVerified: 'desc' }, { profileViews: 'desc' }],
    take: 24,
  })

  const enriched = providers.map(p => ({
    ...p,
    avgRating: p.reviews.length ? Math.round(p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length * 10) / 10 : null,
    reviewCount: p.reviews.length,
    favoritesCount: p._count.favorites,
  }))

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-dark-card to-dark border-b border-dark-border py-12 px-4 text-center">
        <span className="text-5xl mb-3 block">{cat.emoji}</span>
        <h1 className="font-cormorant text-4xl sm:text-5xl font-bold text-white mb-2">
          {cat.name} <span className="text-gradient-rose-gold">à {city}</span>
        </h1>
        <p className="text-white/40 text-sm flex items-center justify-center gap-1 mt-2">
          <MapPin size={13} /> {enriched.length} prestataire{enriched.length > 1 ? 's' : ''} disponible{enriched.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8">
          <Link href={`/categorie/${params.slug}`} className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors shrink-0">
            <ArrowLeft size={15} /> {cat.name} — toutes villes
          </Link>
          <SearchBar className="flex-1" />
        </div>

        {/* Schema.org LocalBusiness list */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `${cat.name} à ${city}`,
          numberOfItems: enriched.length,
          itemListElement: enriched.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${process.env.NEXTAUTH_URL || 'https://mon-prestataire.fr'}/prestataire/${p.slug}`,
          })),
        })}} />

        {enriched.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">{cat.emoji}</p>
            <h2 className="font-cormorant text-2xl text-white mb-2">Aucun prestataire à {city}</h2>
            <p className="text-white/40 text-sm mb-6">Élargissez votre recherche à toute la France.</p>
            <div className="flex gap-3 justify-center">
              <Link href={`/categorie/${params.slug}`} className="btn-secondary">{cat.name} — toutes villes</Link>
              <Link href="/inscription" className="btn-primary">Devenir prestataire</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {enriched.map(p => <ProviderCard key={p.id} provider={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
