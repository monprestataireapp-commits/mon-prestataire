import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Incrémenter les clics d'un prestataire (appelé depuis le front)
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await prisma.provider.update({
      where: { slug: params.slug },
      data: { profileClicks: { increment: 1 } },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const provider = await prisma.provider.findUnique({
    where: { slug: params.slug, isPublished: true },
    include: {
      categories: { include: { category: true } },
      photos: { orderBy: { sortOrder: 'asc' } },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { favorites: true } },
    },
  })
  if (!provider) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const avgRating = provider.reviews.length
    ? Math.round(provider.reviews.reduce((s, r) => s + r.rating, 0) / provider.reviews.length * 10) / 10
    : null

  return NextResponse.json({ provider: { ...provider, avgRating } })
}
