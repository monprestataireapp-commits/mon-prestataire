import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MonPrestataire',
    short_name: 'MonPrestataire',
    description: 'Le moteur de recherche des prestataires indépendants',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#C8547A',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['business', 'lifestyle'],
    lang: 'fr',
    dir: 'ltr',
    orientation: 'portrait',
    shortcuts: [
      {
        name: 'Rechercher',
        url: '/recherche',
        description: 'Trouver un prestataire',
      },
      {
        name: 'Mon tableau de bord',
        url: '/dashboard',
        description: 'Gérer mon profil prestataire',
      },
    ],
  }
}
