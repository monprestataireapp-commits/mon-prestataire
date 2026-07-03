import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Eye, MousePointerClick, Heart, Star, Settings, Zap, MessageSquare, Bell, Send } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { PhotoManager } fhrom '@/compohnents/dashboard/PhotoManager'
import { StripePortalButton } from '@/components/dashboard/StripePortalButton'
import { DevisList } from '@/components/dashboard/DevisList'
import { AvailabilityToggle } from '@/components/dashboard/AvailabilityToggle'
import { VideoManager } from '@/components/dashboard/VideoManager'
import { ProfileCompletion } from '@/components/dashboard/ProfileCompletion'
import { ReviewsManager } from '@/components/dashboard/ReviewsManager'
import { VerificationRequest } from '@/components/dashboard/VerificationRequest'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/connexion')

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({
    where: { userId },
    include: {
      categories: { include: { category: true } },
      photos: { orderBy: { sortOrder: 'asc' } },
      videos: { orderBy: { createdAt: 'desc' } },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      },
      _count: { select: { favorites: true, reviews: true } },
    },
  })

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-cormorant text-3xl text-white mb-3">Pas encore de profil prestataire</h1>
          <Link href="/inscription" className="btn-primary">Créer mon profil</Link>
        </div>
      </div>
    )
  }

  const approvedReviews = provider.reviews.filter((r: any) => r.isApproved)
  const avgRating = approvedReviews.length
    ? Math.round(approvedReviews.reduce((s: number, r: any) => s + r.rating, 0) / approvedReviews.length * 10) / 10
    : null

  const isActive = provider.subscriptionStatus === 'active' || provider.subscriptionStatus === 'trialing'
  const isPremium = provider.subscriptionPlan === 'premium'

  const [pendingReviews, devisCount] = await Promise.all([
    prisma.review.count({ where: { providerId: provider.id, isApproved: false } }),
    prisma.clientRequest.count({ where: { targetProviderId: provider.id } }),
  ])

  const stats = [
    { label: 'Vues du profil', value: provider.profileViews, icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Clics', value: provider.profileClicks, icon: MousePointerClick, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Favoris', value: provider._count.favorites, icon: Heart, color: 'text-rose', bg: 'bg-rose/10' },
    { label: 'Devis reçus', value: devisCount, icon: Send, color: 'text-gold', bg: 'bg-gold/10' },
  ]

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-bold text-white">
            Bonjour, <span className="text-gradient-rose-gold">{provider.businessName}</span> 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">Tableau de bord prestataire</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <AvailabilityToggle initial={provider.isAvailableToday} />
          <Link href={`/prestataire/${provider.slug}`} className="btn-secondary text-sm py-2">
            Voir mon profil
          </Link>
          <Link href="/dashboard/modifier" className="btn-primary text-sm py-2 flex items-center gap-1">
            <Settings size={14} /> Modifier
          </Link>
        </div>
      </div>

      {/* Alerte abonnement */}
      {!isActive && (
        <div className="bg-rose/5 border border-rose/20 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Bell size={20} className="text-rose shrink-0" />
          <div className="flex-1">
            <p className="text-white font-medium">Votre profil est masqué</p>
            <p className="text-white/50 text-sm">Activez un abonnement pour apparaître dans les résultats de recherche.</p>
          </div>
          <Link href="/abonnement" className="btn-primary text-sm py-2 shrink-0">Activer un abonnement</Link>
        </div>
      )}

      {/* Badge fondateur + statut */}
      <div className={`rounded-2xl p-5 mb-6 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${isActive ? 'bg-green-500/5 border-green-500/20' : 'bg-dark-card border-dark-border'}`}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-400' : 'bg-white/20'}`} />
          <span className="text-white font-medium capitalize">
            Formule {provider.subscriptionPlan || 'Aucune'} — {isActive ? 'Active' : 'Inactive'}
          </span>
          {isPremium && <span className="badge-premium">Premium</span>}
          {provider.isFoundingMember && (
            <span className="bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap size={10} /> Membre fondateur — 6 mois offerts
            </span>
          )}
          {provider.isVerified && (
            <span className="badge-verified text-xs">✅ Profil vérifié</span>
          )}
        </div>
        {isActive && provider.subscriptionEndsAt && (
          <p className="text-white/40 text-xs shrink-0">Renouvellement le {formatDate(provider.subscriptionEndsAt)}</p>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-dark-card border border-dark-border rounded-2xl p-4">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="font-cormorant text-3xl font-bold text-white">{stat.value.toLocaleString('fr-FR')}</p>
            <p className="text-white/40 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Demande de vérification */}
      <VerificationRequest
        isVerified={provider.isVerified}
        verificationRequested={provider.verificationRequested}
      />

      {/* Parrainage */}
      {provider.referralCode && (
              <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                                    <Zap size={18} className="text-gold" />
                                    <h2 className="font-cormorant text-xl font-semibold text-white">Parrainage</h2>
                        </div>
                        <p className="text-white/50 text-sm mb-3">Partagez votre lien et gagnez 1€ par inscription !</p>
                        <div className="bg-dark border border-dark-border rounded-xl p-3 mb-4 flex items-center justify-between">
                                    <code className="text-gold text-sm">mon-prestataire.fr/inscription?ref={provider.referralCode}</code>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                                  <p className="font-cormorant text-3xl font-bold text-white">{provider.referralCount}</p>
                                                  <p className="text-white/40 text-xs">Filleuls</p>
                                    </div>
                                    <div className="text-center">
                                                  <p className="font-cormorant text-3xl font-bold text-gold">{provider.referralEarnings}€</p>
                                                  <p className="text-white/40 text-xs">Gains</p>
                                    </div>
                        </div>
              </div>
          )}

      {/* Score de complétion du profil */}
      <ProfileCompletion provider={provider} />

      {/* Graphique de stats */}
      {isPremium && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6">
          <h2 className="font-cormorant text-xl font-semibold text-white mb-4">
            Statistiques avancées <span className="badge-premium ml-2 text-xs">Premium</span>
          </h2>
          <DashboardStats providerId={provider.id} />
        </div>
      )}

      {/* Note moyenne */}
      {avgRating && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0">
            <Star size={24} className="text-gold fill-gold" />
          </div>
          <div>
            <p className="font-cormorant text-4xl font-bold text-white">{avgRating}<span className="text-white/30 text-xl">/5</span></p>
            <p className="text-white/40 text-sm">{provider._count.reviews} avis approuvés{pendingReviews > 0 ? ` · ${pendingReviews} en attente de validation` : ''}</p>
          </div>
        </div>
      )}

      {/* Demandes de devis */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Send size={18} className="text-rose" />
          <h2 className="font-cormorant text-xl font-semibold text-white">Demandes de devis</h2>
        </div>
        <DevisList />
      </div>

      {/* Avis clients */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={18} className="text-gold" />
          <h2 className="font-cormorant text-xl font-semibold text-white">Avis clients</h2>
          {provider._count.reviews > 0 && (
            <span className="ml-auto text-white/40 text-sm">{provider._count.reviews} au total</span>
          )}
        </div>
        <ReviewsManager reviews={provider.reviews as any} />
      </div>

      {/* Gestion des photos */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-cormorant text-xl font-semibold text-white">
            Galerie photos <span className="text-white/30 text-sm font-dm font-normal">({provider.photos.length}/{isPremium ? '∞' : 3})</span>
          </h2>
        </div>
        <PhotoManager
          initialPhotos={provider.photos}
          maxPhotos={isPremium ? 9999 : 3}
          isPremium={isPremium}
        />
      </div>

      {/* Gestion vidéos */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6">
        <h2 className="font-cormorant text-xl font-semibold text-white mb-4">Vidéos de présentation</h2>
        <VideoManager initialVideos={provider.videos} isPremium={isPremium} />
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Link href="/dashboard/modifier" className="bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-rose/30 transition-colors group flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center shrink-0">
            <Settings size={18} className="text-rose" />
          </div>
          <div>
            <p className="text-white font-medium group-hover:text-rose transition-colors text-sm">Modifier le profil</p>
            <p className="text-white/40 text-xs">Description, contacts, livraison…</p>
          </div>
        </Link>

        <Link href="/demandes" className="bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-rose/30 transition-colors group flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center shrink-0">
            <MessageSquare size={18} className="text-rose" />
          </div>
          <div>
            <p className="text-white font-medium group-hover:text-rose transition-colors text-sm">Demandes clients</p>
            <p className="text-white/40 text-xs">Voir et répondre aux demandes</p>
          </div>
        </Link>

        <StripePortalButton isActive={isActive} stripeCustomerId={provider.stripeCustomerId} isPremium={isPremium} />
      </div>

      {/* Catégories */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-cormorant text-xl font-semibold text-white">Mes catégories</h2>
          <Link href="/dashboard/modifier" className="text-rose text-xs hover:underline">Modifier</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {provider.categories.map(c => (
            <span key={c.categoryId} className="flex items-center gap-1.5 bg-dark border border-dark-border text-white/60 rounded-full px-3 py-1.5 text-sm">
              {c.category.emoji} {c.category.name}
            </span>
          ))}
          {provider.categories.length === 0 && (
            <p className="text-white/30 text-sm">Aucune catégorie sélectionnée.</p>
          )}
        </div>
      </div>
    </div>
  )
}

