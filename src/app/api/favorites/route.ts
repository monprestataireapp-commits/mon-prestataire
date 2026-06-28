import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { providerId } = await req.json()
  const userId = (session.user as any).id

  const existing = await prisma.favorite.findUnique({
    where: { userId_providerId: { userId, providerId } },
  })

  if (existing) {
    await prisma.favorite.delete({ where: { userId_providerId: { userId, providerId } } })
    return NextResponse.json({ favorited: false })
  } else {
    await prisma.favorite.create({ data: { userId, providerId } })
    return NextResponse.json({ favorited: true })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ favorites: [] })

  const userId = (session.user as any).id
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      provider: {
        include: {
          categories: { include: { category: true } },
          reviews: { where: { isApproved: true }, select: { rating: true } },
        },
      },
    },
  })

  return NextResponse.json({
    favorites: favorites.map(f => ({
      ...f.provider,
      avgRating: f.provider.reviews.length
        ? Math.round(f.provider.reviews.reduce((s, r) => s + r.rating, 0) / f.provider.reviews.length * 10) / 10
        : null,
      reviewCount: f.provider.reviews.length,
    })),
  })
}
