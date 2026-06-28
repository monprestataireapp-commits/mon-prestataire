'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-cormorant text-8xl font-bold text-gradient-rose-gold mb-4">500</p>
        <h1 className="font-cormorant text-3xl font-bold text-white mb-3">Une erreur est survenue</h1>
        <p className="text-white/50 text-sm mb-8 leading-relaxed">
          Une erreur inattendue s&apos;est produite. Notre équipe a été notifiée. Essayez de rafraîchir la page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary flex items-center justify-center gap-2">
            <RefreshCw size={15} /> Réessayer
          </button>
          <Link href="/" className="btn-secondary flex items-center justify-center gap-2">
            <Home size={15} /> Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

