import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { CATEGORIES } from '@/lib/categories'
import { BLOG_POSTS } from '@/lib/blog'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://mon-prestataire.fr'

  const providers = await prisma.provider.findMany({
    where: { isPublished: true, subscriptionStatus: 'active' },
    select: { slug: true, updatedAt: true },
  })

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/recherche`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/inscription`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/abonnement`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/demandes`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/cgu`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/confidentialite`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/mentions-legales`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map(cat => ({
    url: `${baseUrl}/categorie/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const providerRoutes: MetadataRoute.Sitemap = providers.map(p => ({
    url: `${baseUrl}/prestataire/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Pages catégorie × ville pour les villes avec au moins 1 prestataire
  const cityStats = await prisma.provider.groupBy({
    by: ['city'],
    where: { isPublished: true, subscriptionStatus: 'active' },
    _count: { city: true },
  })

  const catCityRoutes: MetadataRoute.Sitemap = []
  for (const cat of CATEGORIES) {
    for (const stat of cityStats) {
      if (stat._count.city >= 1 && stat.city) {
        const citySlug = stat.city.toLowerCase().replace(/\s+/g, '-')
        catCityRoutes.push({
          url: `${baseUrl}/categorie/${cat.slug}/${encodeURIComponent(citySlug)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
  }

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map(p => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...blogRoutes, ...categoryRoutes, ...catCityRoutes, ...providerRoutes]
}
