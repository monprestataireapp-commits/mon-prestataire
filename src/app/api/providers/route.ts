import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const city = searchParams.get('city') || ''
  const region = searchParams.get('region') || ''
  const department = searchParams.get('department') || ''
  const plan = searchParams.get('plan') || ''
  const verified = searchParams.get('verified') === 'true'
  const available = searchParams.get('available') === 'true'
  const hasDelivery = searchParams.get('delivery') === 'true'
  const priceMax = searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : null
  const sort = searchParams.get('sort') || 'default'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')

  const where: any = {
    isPublished: true,
    subscriptionStatus: { in: ['active', 'trialing'] },
  }

  if (q) {
    where.OR = [
      { businessName: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (city) where.city = { contains: city, mode: 'insensitive' }
  if (region) where.region = { contains: region, mode: 'insensitive' }
  if (department) where.department = { contains: department, mode: 'insensitive' }
  if (plan) where.subscriptionPlan = plan
  if (verified) where.isVerified = true
  if (available) where.isAvailableToday = true
  if (hasDelivery) where.hasDelivery = true
  if (priceMax) where.priceMin = { lte: priceMax }
  if (category) where.categories = { some: { category: { slug: category } } }

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      include: {
        categories: { include: { category: true } },
        photos: { take: 3, orderBy: { sortOrder: 'asc' } },
        reviews: { where: { isApproved: true }, select: { rating: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: sort === 'views'
        ? [{ profileViews: 'desc' }]
        : sort === 'recent'
        ? [{ createdAt: 'desc' }]
        : sort === 'price_asc'
        ? [{ priceMin: 'asc' }]
        : sort === 'price_desc'
        ? [{ priceMin: 'desc' }]
        : [{ subscriptionPlan: 'desc' }, { isVerified: 'desc' }, { profileViews: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.provider.count({ where }),
  ])

  const result = providers.map((p) => {
    const avg = p.reviews.length
      ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
      : null
    return {
      ...p,
      avgRating: avg ? Math.round(avg * 10) / 10 : null,
      reviewCount: p.reviews.length,
      favoritesCount: p._count.favorites,
      reviews: undefined,
      _count: undefined,
    }
  })

  return NextResponse.json({ providers: result, total, pages: Math.ceil(total / limit) })
}
