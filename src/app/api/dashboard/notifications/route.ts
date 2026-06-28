import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ count: 0 })

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({ where: { userId }, select: { id: true } })
  if (!provider) return NextResponse.json({ count: 0 })

  // Devis reçus dans les dernières 48h
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000)
  const newDevis = await prisma.clientRequest.count({
    where: { targetProviderId: provider.id, createdAt: { gte: since } },
  })

  // Avis en attente
  const pendingReviews = await prisma.review.count({
    where: { providerId: provider.id, isApproved: false },
  })

  return NextResponse.json({
    count: newDevis + pendingReviews,
    newDevis,
    pendingReviews,
  })
}
