import Link from 'next/link'
import { Search, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-cormorant text-9xl font-bold text-gradient-rose-gold mb-4">404</p>
        <h1 className="font-cormorant text-3xl font-bold text-white mb-3">Page introuvable</h1>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">
          Cette page n&apos;existe pas ou le prestataire que vous cherchez n&apos;est plus disponible.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-secondary flex items-center justify-center gap-2">
            <Home size={15} /> Accueil
          </Link>
          <Link href="/recherche" className="btn-primary flex items-center justify-center gap-2">
            <Search size={15} /> Rechercher un prestataire
          </Link>
        </div>
      </div>
    </div>
  )
}

