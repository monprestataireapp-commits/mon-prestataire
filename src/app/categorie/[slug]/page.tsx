import { prisma } from '@/lib/prisma'
import { CATEGORIES } from '@/lib/categories'
import { SPECIALTIES } from '@/lib/specialties'
import { notFound } from 'next/navigation'
import { CategoryPageClient } from './CategoryPageClient'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'

export const revalidate = 3600

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const cat = CATEGORIES.find(c => c.slug === params.slug)
  if (!cat) return {}
  return {
    title: `${cat.emoji} ${cat.name} — MonPrestataire`,
    description: `Trouvez les meilleurs prestataires en ${cat.name.toLowerCase()} près de chez vous.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const cat = CATEGORIES.find(c => c.slug === params.slug)
  if (!cat) notFound()

  const cityStats = await prisma.provider.groupBy({
    by: ['city'],
    where: {
      isPublished: true,
      subscriptionStatus: 'active',
      categories: { some: { category: { slug: params.slug } } },
    },
    _count: { city: true },
    orderBy: { _count: { city: 'desc' } },
    take: 12,
  })

  const providers = await prisma.provider.findMany({
    where: {
      isPublished: true,
      subscriptionStatus: 'active',
      categories: { some: { category: { slug: params.slug } } },
    },
    include: {
      categories: { include: { category: true } },
      photos: { take: 1, orderBy: { sortOrder: 'asc' } },
      reviews: { where: { isApproved: true }, select: { rating: true } },
      _count: { select: { favorites: true } },
    },
    orderBy: [{ subscriptionPlan: 'desc' }, { isVerified: 'desc' }, { profileViews: 'desc' }],
    take: 60,
  })

  const enriched = providers.map(p => ({
    ...p,
    avgRating: p.reviews.length ? Math.round(p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length * 10) / 10 : null,
    reviewCount: p.reviews.length,
    favoritesCount: p._count.favorites,
    specialties: (() => { try { return JSON.parse((p as any).specialties || '[]') } catch { return [] } })() as string[],
  }))

  const specialties = SPECIALTIES[params.slug] ?? []

  return (
    <div>
      {/* Hero catégorie */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <Image src={cat.image} alt={cat.name} fill className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-5xl mb-2">{cat.emoji}</span>
          <h1 className="font-cormorant text-4xl sm:text-5xl font-bold text-white mb-2">{cat.name}</h1>
          <p className="text-white/60 text-sm max-w-md">{cat.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back + search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8">
          <Link href="/recherche" className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors shrink-0">
            <ArrowLeft size={15} /> Toutes les catégories
          </Link>
          <SearchBar className="flex-1" />
        </div>

        {/* Liens villes */}
        {cityStats.length > 0 && (
          <div className="mb-6">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Par ville</p>
            <div className="flex flex-wrap gap-2">
              {cityStats.map(s => s.city && (
                <Link
                  key={s.city}
                  href={`/categorie/${params.slug}/${encodeURIComponent(s.city.toLowerCase().replace(/\s+/g, '-'))}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dark-border text-white/50 hover:border-rose/30 hover:text-white text-sm transition-colors"
                >
                  📍 {s.city}
                  <span className="text-white/20 text-xs">({s._count.city})</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Partie client : filtres spécialités + grille */}
        <CategoryPageClient
          providers={enriched}
          specialties={specialties}
          cat={{ slug: params.slug, name: cat.name, emoji: cat.emoji }}
        />
      </div>
    </div>
  )
}
