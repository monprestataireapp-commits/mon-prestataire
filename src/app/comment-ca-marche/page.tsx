import Link from 'next/link'
import { Search, UserCheck, Star, Zap, Shield, MessageSquare, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Comment ça marche — MonPrestataire',
  description: 'Découvrez comment trouver votre prestataire idéal ou référencer votre activité sur MonPrestataire.',
}

const clientSteps = [
  { icon: Search, title: 'Recherchez', desc: 'Utilisez la barre de recherche intelligente ou parcourez les 21 catégories. Affinez par ville, budget, disponibilité ou formule.' },
  { icon: UserCheck, title: 'Consultez les profils', desc: 'Accédez aux galeries photos, avis vérifiés, tarifs et coordonnées directement sur le profil du prestataire.' },
  { icon: MessageSquare, title: 'Contactez', desc: 'Appelez directement (Standard/Premium) ou publiez une demande publique pour recevoir des offres spontanées.' },
  { icon: Star, title: 'Laissez un avis', desc: 'Après votre prestation, partagez votre expérience pour aider la communauté.' },
]

const providerSteps = [
  { icon: UserCheck, title: 'Créez votre profil', desc: 'Renseignez votre activité, vos catégories, votre localisation et vos informations de livraison en 5 étapes.' },
  { icon: Zap, title: 'Choisissez votre formule', desc: 'Standard (4,99€/mois) ou Premium (9,99€/mois). Les 100 premiers prestataires bénéficient de 6 mois offerts.' },
  { icon: Shield, title: 'Faites-vous vérifier', desc: 'Soumettez vos documents pour obtenir le badge Vérifié et gagner en crédibilité auprès des clients.' },
  { icon: Star, title: 'Développez votre activité', desc: 'Gérez vos photos, répondez aux demandes clients, et suivez vos statistiques depuis votre tableau de bord.' },
]

export default function CommentCaMarchePage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="font-cormorant text-5xl sm:text-6xl font-bold text-white mb-4">
            Comment ça <span className="text-gradient-rose-gold">marche ?</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            MonPrestataire met en relation clients et prestataires indépendants en France, simplement et efficacement.
          </p>
        </div>

        {/* Pour les clients */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center">
              <Search size={18} className="text-rose" />
            </div>
            <h2 className="font-cormorant text-3xl font-bold text-white">Pour les clients</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {clientSteps.map((step, i) => (
              <div key={step.title} className="bg-dark-card border border-dark-border rounded-2xl p-5 relative">
                <div className="w-8 h-8 rounded-full bg-rose/10 border border-rose/20 flex items-center justify-center text-rose text-sm font-bold mb-4">
                  {i + 1}
                </div>
                <step.icon size={20} className="text-rose mb-3" />
                <h3 className="font-cormorant text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/recherche" className="btn-primary inline-flex items-center gap-2">
              Trouver un prestataire <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Pour les prestataires */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Zap size={18} className="text-gold" />
            </div>
            <h2 className="font-cormorant text-3xl font-bold text-white">Pour les prestataires</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {providerSteps.map((step, i) => (
              <div key={step.title} className="bg-dark-card border border-dark-border rounded-2xl p-5">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-sm font-bold mb-4">
                  {i + 1}
                </div>
                <step.icon size={20} className="text-gold mb-3" />
                <h3 className="font-cormorant text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/inscription" className="btn-gold inline-flex items-center gap-2">
              Référencer mon activité <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-dark-card border border-dark-border rounded-3xl p-8">
          <h2 className="font-cormorant text-3xl font-bold text-white mb-6">Questions fréquentes</h2>
          <div className="space-y-5">
            {[
              { q: 'MonPrestataire est-il gratuit pour les clients ?', a: 'Oui, totalement gratuit pour les clients. Recherche, consultation des profils et demandes : aucun frais.' },
              { q: 'Quelle est la différence entre Standard et Premium ?', a: 'Standard (4,99€/mois) : profil complet, 20 photos, téléphone visible. Premium (9,99€/mois) : tout Standard + 50 photos, statistiques avancées, mise en avant prioritaire.' },
              { q: 'Puis-je tester sans engagement ?', a: 'Les 100 premiers prestataires bénéficient de 6 mois gratuits avec le coupon LANCEMENT6MOIS, appliqué automatiquement à l\'inscription.' },
              { q: 'Comment obtenir le badge Vérifié ?', a: 'Contactez notre équipe avec vos justificatifs d\'activité (KBIS, attestation SIRET, ou tout document prouvant votre activité). La vérification est manuelle.' },
              { q: 'L\'abonnement est-il sans engagement ?', a: 'Oui, les formules mensuelle et annuelle sont sans engagement. Vous pouvez résilier à tout moment depuis votre tableau de bord.' },
            ].map(faq => (
              <div key={faq.q} className="border-b border-dark-border pb-5 last:border-0 last:pb-0">
                <p className="text-white font-medium mb-1.5">{faq.q}</p>
                <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="text-center mt-12">
          <p className="text-white/40 text-sm mb-4">Une question ? Notre équipe est là pour vous aider.</p>
          <Link href="/contact" className="btn-secondary inline-flex items-center gap-2">
            Nous contacter <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}

