import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function AnnulationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-dark-border flex items-center justify-center mx-auto mb-6">
          <XCircle size={36} className="text-white/30" />
        </div>
        <h1 className="font-cormorant text-4xl font-bold text-white mb-3">Paiement annulé</h1>
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          Vous n&apos;avez pas été débité. Vous pouvez reprendre l&apos;abonnement à tout moment.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/abonnement" className="btn-primary">Voir les offres</Link>
          <Link href="/" className="btn-secondary">Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  )
}

