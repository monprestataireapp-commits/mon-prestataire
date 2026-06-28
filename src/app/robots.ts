import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://mon-prestataire.fr'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/api/', '/compte/', '/espace-client/', '/favoris/', '/mes-demandes/', '/abonnement/succes', '/abonnement/annulation'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
