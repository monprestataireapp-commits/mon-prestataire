import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { providerId, rating, comment } = await req.json()
  const userId = (session.user as any).id

  if (!providerId || !rating || !comment) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const existing = await prisma.review.findFirst({ where: { providerId, userId } })
  if (existing) {
    return NextResponse.json({ error: 'Avis déjà soumis' }, { status: 400 })
  }

  const review = await prisma.review.create({
    data: {
      providerId,
      userId,
      rating: Math.min(5, Math.max(1, parseInt(rating))),
      comment,
      isApproved: false,
    },
  })

  return NextResponse.json({ review })
}
