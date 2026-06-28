import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [providers, activeSubscriptions, totalReviews, totalFavorites] = await Promise.all([
    prisma.provider.count({ where: { isPublished: true } }),
    prisma.provider.count({ where: { subscriptionStatus: 'active' } }),
    prisma.review.count({ where: { isApproved: true } }),
    prisma.favorite.count(),
  ])

  // Mise à jour du compteur de membres fondateurs
  const foundingCount = await prisma.provider.count({
    where: { subscriptionStatus: 'active', isFoundingMember: true },
  })
  await prisma.siteConfig.upsert({
    where: { key: 'founding_members_count' },
    update: { value: String(foundingCount) },
    create: { key: 'founding_members_count', value: String(foundingCount) },
  })

  return NextResponse.json({
    success: true,
    stats: { providers, activeSubscriptions, totalReviews, totalFavorites, foundingCount },
  })
}
