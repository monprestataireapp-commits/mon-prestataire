import Link from 'next/link'
import { CheckCircle, Zap, ArrowRight } from 'lucide-react'

export default function SuccesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-green-400" />
        </div>
        <h1 className="font-cormorant text-4xl font-bold text-white mb-3">
          Bienvenue dans l&apos;aventure !
        </h1>
        <p className="text-white/50 text-sm leading-relaxed mb-2">
          Votre abonnement est maintenant actif. Votre profil est visible sur MonPrestataire et commence à gagner en visibilité.
        </p>
        <div className="bg-gold/5 border border-gold/20 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <Zap size={18} className="text-gold shrink-0" />
          <p className="text-gold/80 text-sm text-left">
            Complétez votre profil pour maximiser vos chances d&apos;être contacté : photo de couverture, galerie, description détaillée.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard/modifier" className="btn-primary flex items-center justify-center gap-2">
            Compléter mon profil <ArrowRight size={15} />
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  )
}

