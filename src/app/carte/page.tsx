import { Metadata } from 'next'
import { MapView } from '@/components/map/MapView'

export const metadata: Metadata = {
  title: 'Carte des prestataires — MonPrestataire',
  description: 'Trouvez des prestataires de beauté et bien-être près de chez vous sur la carte interactive.',
}

export default function CartePage() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-cormorant text-3xl sm:text-4xl font-bold text-white mb-1">
          Carte des <span className="text-gradient-rose-gold">prestataires</span>
        </h1>
        <p className="text-white/40 text-sm">Trouvez un prestataire près de chez vous</p>
      </div>
      <MapView />
    </div>
  )
}
