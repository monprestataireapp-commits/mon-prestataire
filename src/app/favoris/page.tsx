import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, Search } from 'lucide-react'
import { ProviderCard } from '@/components/provider/ProviderCard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mes favoris — MonPrestataire',
  description: 'Les prestataires que vous avez mis en favoris.',
}

export default async function FavorisPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/connexion')

  const userId = (session.user as any).id

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      provider: {
        include: {
          categories: { include: { category: true } },
          photos: { take: 3, orderBy: { sortOrder: 'asc' } },
          reviews: { where: { isApproved: true }, select: { rating: true } },
          _count: { select: { favorites: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const providers = favorites
    .filter(f => f.provider.isPublished)
    .map(f => {
      const p = f.provider
      const avg = p.reviews.length
        ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
        : null
      return {
        ...p,
        avgRating: avg ? Math.round(avg * 10) / 10 : null,
        reviewCount: p.reviews.length,
        favoritesCount: p._count.favorites,
        reviews: undefined,
        _count: undefined,
      }
    })

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-bold text-white mb-1">
            Mes <span className="text-gradient-rose-gold">favoris</span>
          </h1>
          <p className="text-white/40 text-sm">{providers.length} prestataire{providers.length > 1 ? 's' : ''} sauvegardé{providers.length > 1 ? 's' : ''}</p>
        </div>
        <Link href="/recherche" className="btn-secondary flex items-center gap-2 text-sm">
          <Search size={14} /> Découvrir plus
        </Link>
      </div>

      {providers.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-rose/10 flex items-center justify-center mx-auto mb-6">
            <Heart size={32} className="text-rose" />
          </div>
          <h2 className="font-cormorant text-2xl text-white mb-2">Aucun favori pour le moment</h2>
          <p className="text-white/40 text-sm mb-6 max-w-xs mx-auto">
            Cliquez sur le cœur sur un profil prestataire pour l&apos;ajouter à vos favoris.
          </p>
          <Link href="/recherche" className="btn-primary">Parcourir les prestataires</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {providers.map(p => (
            <ProviderCard key={p.id} provider={p as any} />
          ))}
        </div>
      )}
    </div>
  )
}

