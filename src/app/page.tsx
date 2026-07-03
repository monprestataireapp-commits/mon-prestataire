import { prisma } from '@/lib/prisma'
import { SearchBar } from '@/components/search/SearchBar'
import { ProviderCard } from '@/components/provider/ProviderCard'
import { CATEGORIES } from '@/lib/categories'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Users, Shield, Zap, Check } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getFeaturedProviders() {
  const providers = await prisma.provider.findMany({
    where: { isPublished: true, subscriptionStatus: { in: ['active', 'trialing'] } },
    include: {
      categories: { include: { category: true } },
      photos: { take: 1, orderBy: { sortOrder: 'asc' } },
      reviews: { where: { isApproved: true }, select: { rating: true } },
      _count: { select: { favorites: true } },
    },
    orderBy: [{ subscriptionPlan: 'desc' }, { isVerified: 'desc' }, { profileViews: 'desc' }],
    take: 8,
  })
  return providers.map(p => ({
    ...p,
    avgRating: p.reviews.length ? Math.round(p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length * 10) / 10 : null,
    reviewCount: p.reviews.length,
    favoritesCount: p._count.favorites,
  }))
}

async function getFoundingCount() {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'founding_members_count' } })
  return parseInt(config?.value || '0')
}

async function getSiteStats() {
  const [totalProviders, totalReviews, verifiedCount] = await Promise.all([
    prisma.provider.count({ where: { isPublished: true, subscriptionStatus: 'active' } }),
    prisma.review.count({ where: { isApproved: true } }),
    prisma.provider.count({ where: { isVerified: true, isPublished: true } }),
  ])
  return { totalProviders, totalReviews, verifiedCount }
}

export default async function HomePage() {
  const [providers, foundingCount, siteStats] = await Promise.all([
    getFeaturedProviders(), getFoundingCount(), getSiteStats(),
  ])
  const remaining = Math.max(0, 100 - foundingCount)

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1920&q=80"
            alt="Fond MonPrestataire"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-radial from-rose/5 via-dark/80 to-dark" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Badges hero */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 bg-rose/10 border border-rose/30 rounded-full px-4 py-2 text-sm">
              <span className="text-rose font-medium">💜 Clientes :</span>
              <span className="text-white/70">inscription 100% gratuite</span>
            </div>
            {remaining > 0 && (
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-2 text-sm">
                <Zap size={14} className="text-gold" />
                <span className="text-gold font-medium">Prestataires :</span>
                <span className="text-white/70">6 mois gratuits — encore</span>
                <span className="bg-gold text-white font-bold rounded-full px-2 py-0.5 text-xs">{remaining}</span>
                <span className="text-white/70">places</span>
              </div>
            )}
          </div>

          <h1 className="font-cormorant text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-4">
            <span className="text-white">Le premier moteur</span>
            <br />
            <span className="text-gradient-rose-gold">de recherche</span>
            <br />
            <span className="text-white">des indépendants</span>
          </h1>

          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Trouvez le prestataire parfait pour votre mariage, événement ou projet.
            Maquillage, photographie, décoration, traiteur et bien plus encore.
          </p>

          <SearchBar className="max-w-2xl mx-auto" />

          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {['Maquillage Paris', 'Photographe Marseille', 'Décoration mariage', 'Gâteau Lyon'].map(tag => (
              <Link
                key={tag}
                href={`/recherche?q=${encodeURIComponent(tag)}`}
                className="text-xs bg-dark-card border border-dark-border text-white/50 rounded-full px-3 py-1.5 hover:border-rose/30 hover:text-rose transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-12">
                        <p className="text-white/30 text-xs">Plateforme lancée le 2 juillet 2026 — nos chiffres sont réels</p>
            {[
              { label: 'Prestataires', value: siteStats.totalProviders > 0 ? `${siteStats.totalProviders}` : '0', icon: Users },
              { label: 'Avis vérifiés', value: siteStats.totalReviews > 0 ? `${siteStats.totalReviews}` : '0', icon: Star },
              { label: 'Prestataires vérifiés', value: siteStats.verifiedCount > 0 ? `${siteStats.verifiedCount}` : '0', icon: Shield },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="font-cormorant text-3xl font-bold text-gradient-rose-gold">{stat.value}</p>
                <p className="text-white/40 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offre double — clientes & prestataires */}
      <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Clientes */}
          <div className="relative bg-dark-card border border-rose/20 rounded-3xl p-7 flex flex-col gap-5 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="inline-flex items-center gap-2 bg-rose/10 text-rose text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
              💜 Espace clientes
            </div>
            <div>
              <p className="font-cormorant text-3xl font-bold text-white leading-tight">
                Inscription <span className="text-gradient-rose-gold">100% gratuite</span>
              </p>
              <p className="text-white/50 text-sm mt-2 leading-relaxed">
                Trouvez, comparez et contactez les meilleurs prestataires indépendants près de chez vous.
              </p>
            </div>
            <ul className="space-y-2">
              {['Recherche illimitée', 'Sauvegardez vos favoris', 'Publiez vos demandes', 'Accès aux avis vérifiés'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                  <Check size={14} className="text-rose shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/inscription-client" className="btn-primary inline-flex items-center gap-2 w-fit mt-auto">
              Créer mon compte gratuit <ArrowRight size={15} />
            </Link>
          </div>

          {/* Prestataires */}
          <div className="relative bg-dark-card border border-gold/20 rounded-3xl p-7 flex flex-col gap-5 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
              <Zap size={12} /> Offre lancement
            </div>
            <div>
              <p className="font-cormorant text-3xl font-bold text-white leading-tight">
                {remaining > 0 ? (
                  <>6 mois <span className="text-gradient-rose-gold">offerts</span></>
                ) : (
                  <>Seulement <span className="text-gradient-rose-gold">4,99€/mois</span></>
                )}
              </p>
              <p className="text-white/50 text-sm mt-2 leading-relaxed">
                {remaining > 0
                  ? `Les 100 premières prestataires bénéficient de 6 mois gratuits. Plus que ${remaining} places !`
                  : 'Publiez votre profil et soyez visible par des milliers de clientes.'}
              </p>
            </div>
            {remaining > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-white/40">
                  <span>{foundingCount}/100 places prises</span>
                  <span className="text-gold font-medium">Puis 4,99€/mois</span>
                </div>
                <div className="h-2 bg-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose to-gold rounded-full transition-all"
                    style={{ width: `${Math.max(5, (foundingCount / 100) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            <ul className="space-y-2">
              {['Profil complet avec photos & vidéos', 'Visibilité sur toutes les recherches', 'Avis clients vérifiés', 'Sans engagement'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                  <Check size={14} className="text-gold shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/inscription" className="btn-gold inline-flex items-center gap-2 w-fit mt-auto">
              {remaining > 0 ? 'Profiter de l\'offre' : 'Rejoindre MonPrestataire'} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-cormorant text-3xl sm:text-4xl font-bold text-white">
            Toutes les <span className="text-gradient-rose-gold">catégories</span>
          </h2>
          <Link href="/recherche" className="text-rose text-sm hover:text-rose-light transition-colors flex items-center gap-1">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.slice(0, 21).map(cat => (
            <Link
              key={cat.slug}
              href={`/categorie/${cat.slug}`}
              className="group bg-dark-card border border-dark-border rounded-2xl overflow-hidden hover:border-rose/30 transition-all hover:shadow-lg hover:shadow-rose/10 card-hover"
            >
              <div className="relative h-24 overflow-hidden">
                <Image src={cat.image} alt={cat.name} fill className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500" sizes="200px" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent" />
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="text-xl">{cat.emoji}</span>
                </div>
              </div>
              <div className="p-2 text-center">
                <p className="text-xs text-white/70 group-hover:text-white transition-colors leading-tight line-clamp-2">
                  {cat.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Prestataires vedettes */}
      {providers.length > 0 && (
        <section className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-cormorant text-3xl sm:text-4xl font-bold text-white">
              Prestataires <span className="text-gradient-rose-gold">en vedette</span>
            </h2>
            <Link href="/recherche" className="text-rose text-sm hover:text-rose-light transition-colors flex items-center gap-1">
              Voir tous <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {providers.map(p => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        </section>
      )}

      {/* Offre lancement */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="border-gradient rounded-3xl p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Zap size={14} />
              Offre lancement — Prestataires
            </div>
            <h2 className="font-cormorant text-4xl sm:text-5xl font-bold text-white mb-4">
              6 mois <span className="text-gradient-rose-gold">offerts</span>
            </h2>
            <p className="text-white/60 text-lg mb-2">
              Les 100 premières prestataires inscrites bénéficient de <strong className="text-white">6 mois gratuits</strong>, puis seulement <strong className="text-gold">4,99€/mois</strong>.
            </p>
            {remaining > 0 && (
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="flex-1 max-w-xs h-2 bg-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose to-gold rounded-full transition-all"
                    style={{ width: `${(foundingCount / 100) * 100}%` }}
                  />
                </div>
                <span className="text-white/50 text-sm whitespace-nowrap">{foundingCount}/100 places prises</span>
              </div>
            )}
            <Link href="/inscription" className="btn-gold inline-flex items-center gap-2">
              Rejoindre maintenant <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Inscription cliente */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="bg-dark-card border border-dark-border rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-rose/10 text-rose text-sm font-medium px-4 py-2 rounded-full mb-5">
              💜 Espace clients
            </div>
            <h2 className="font-cormorant text-3xl sm:text-4xl font-bold text-white mb-4">
              Créez votre compte <span className="text-gradient-rose-gold">gratuitement</span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-md mb-8">
              Sauvegardez vos prestataires favoris, publiez vos demandes et retrouvez tout votre historique en un clic.
            </p>
            <Link href="/inscription-client" className="btn-primary inline-flex items-center gap-2">
              Créer mon compte <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 w-full md:w-auto md:min-w-[260px]">
            {[
              { icon: '❤️', title: 'Favoris', desc: 'Sauvegardez vos prestataires préférés' },
              { icon: '📋', title: 'Demandes', desc: 'Publiez vos besoins, recevez des offres' },
              { icon: '🔔', title: 'Alertes', desc: 'Soyez notifié des nouveaux prestataires' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-3 bg-dark-surface border border-dark-border rounded-xl p-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <h2 className="font-cormorant text-3xl sm:text-4xl font-bold text-white text-center mb-12">
          Comment ça <span className="text-gradient-rose-gold">marche ?</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Recherchez', desc: 'Tapez votre besoin en langage naturel : "Maquilleuse Paris mariage"', icon: '🔍' },
            { step: '02', title: 'Comparez', desc: 'Consultez les profils, avis, photos et tarifs. Ajoutez en favoris.', icon: '⭐' },
            { step: '03', title: 'Contactez', desc: 'Contactez directement via le numéro de téléphone ou les réseaux sociaux.', icon: '📱' },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose/10 border border-rose/20 flex items-center justify-center text-2xl mx-auto mb-4">
                {item.icon}
              </div>
              <div className="text-gold/50 font-cormorant text-lg mb-2">{item.step}</div>
              <h3 className="font-cormorant text-xl font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demandes clients CTA */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="bg-dark-card border border-dark-border rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="font-cormorant text-3xl font-bold text-white mb-2">
              Publiez votre demande
            </h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-lg">
              Décrivez votre besoin et laissez les prestataires vous contacter directement.
              &ldquo;Je cherche une maquilleuse pour un mariage le 10 août à Paris, budget 80€&rdquo;
            </p>
          </div>
          <Link href="/demandes" className="btn-primary shrink-0 flex items-center gap-2">
            Publier une demande <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}

