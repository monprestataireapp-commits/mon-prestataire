import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CATEGORIES } from '@/lib/categories'

const CITIES = [
  'paris', 'lyon', 'marseille', 'toulouse', 'bordeaux', 'lille', 'nantes', 'strasbourg', 'nice',
  'montpellier', 'rennes', 'grenoble', 'rouen', 'toulon', 'saint-étienne', 'dijon', 'angers',
  'reims', 'brest', 'le havre', 'clermont-ferrand', 'metz', 'nancy', 'perpignan', 'orléans',
]

function extractIntent(q: string) {
  const lower = q.toLowerCase()

  const city = CITIES.find(c => lower.includes(c)) || null

  const SYNONYMS: [string, string][] = [
    ['maquilleur', 'maquillage-beaute'], ['maquilleuse', 'maquillage-beaute'],
    ['coiffeur', 'coiffure-onglerie'], ['coiffeuse', 'coiffure-onglerie'],
    ['photographe', 'photographie'],
    ['vidéaste', 'videaste'], ['cameraman', 'videaste'],
    [' dj ', 'dj-animation'],
    ['gâteau', 'gateaux-sucreries'], ['gateau', 'gateaux-sucreries'],
    ['pâtisserie', 'gateaux-sucreries'], ['patisserie', 'gateaux-sucreries'],
    ['traiteur', 'traiteur-cuisine'],
    ['décor', 'decoration-events'], ['decore', 'decoration-events'],
    ['wedding', 'mariage'], ['mariage', 'mariage'],
    ['bijou', 'bijoux-accessoires'],
    ['bougie', 'bougies-parfums'],
    ['couture', 'mode-couture'],
  ]

  const synonymSlug = SYNONYMS.find(([kw]) => lower.includes(kw))?.[1]
  const category = CATEGORIES.find(cat =>
    lower.includes(cat.name.toLowerCase()) ||
    lower.includes(cat.slug.toLowerCase()) ||
    cat.slug === synonymSlug
  ) || null

  const wantsDelivery = lower.includes('livraison') || lower.includes('livré') || lower.includes('expédi')
  const wantsAvailable = lower.includes('disponible') || lower.includes('disponibilité')
  const wantsPremium = lower.includes('premium')
  const wantsVerified = lower.includes('vérifié') || lower.includes('certifié')

  return { city, category, wantsDelivery, wantsAvailable, wantsPremium, wantsVerified }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  if (!q) return NextResponse.json({ providers: [] })

  const intent = extractIntent(q)

  const where: any = {
    isPublished: true,
    OR: [
      { subscriptionStatus: 'active' },
      { subscriptionStatus: 'trialing' },
    ],
  }

  if (intent.city) where.city = { contains: intent.city, mode: 'insensitive' }
  if (intent.category) where.categories = { some: { category: { slug: intent.category.slug } } }
  if (intent.wantsDelivery) where.hasDelivery = true
  if (intent.wantsAvailable) where.isAvailableToday = true
  if (intent.wantsPremium) where.subscriptionPlan = 'premium'
  if (intent.wantsVerified) where.isVerified = true

  // Si aucun intent spécifique, recherche textuelle large
  if (!intent.city && !intent.category) {
    where.OR = [
      { businessName: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
      { categories: { some: { category: { name: { contains: q, mode: 'insensitive' } } } } },
    ]
  }

  const providers = await prisma.provider.findMany({
    where,
    include: {
      categories: { include: { category: true } },
      reviews: { where: { isApproved: true }, select: { rating: true } },
    },
    orderBy: [{ subscriptionPlan: 'desc' }, { isVerified: 'desc' }, { profileViews: 'desc' }],
    take: 8,
  })

  return NextResponse.json({
    intent: { city: intent.city, category: intent.category?.name },
    providers: providers.map(p => ({
      id: p.id,
      slug: p.slug,
      businessName: p.businessName,
      city: p.city,
      region: p.region,
      profilePhoto: p.profilePhoto,
      subscriptionPlan: p.subscriptionPlan,
      isVerified: p.isVerified,
      categories: p.categories.map(c => c.category.name),
      avgRating: p.reviews.length
        ? Math.round(p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length * 10) / 10
        : null,
      reviewCount: p.reviews.length,
    })),
  })
}
