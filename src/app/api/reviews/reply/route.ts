import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { reviewId, reply } = await req.json()
  if (!reviewId || !reply?.trim()) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })

  const provider = await prisma.provider.findUnique({ where: { userId: (session.user as any).id } })
  if (!provider) return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 })

  const review = await prisma.review.findFirst({
    where: { id: reviewId, providerId: provider.id },
  })
  if (!review) return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 })

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { reply: reply.trim(), repliedAt: new Date() },
  })

  return NextResponse.json({ review: updated })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const reviewId = searchParams.get('reviewId')
  if (!reviewId) return NextResponse.json({ error: 'reviewId manquant' }, { status: 400 })

  const provider = await prisma.provider.findUnique({ where: { userId: (session.user as any).id } })
  if (!provider) return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 })

  const review = await prisma.review.findFirst({ where: { id: reviewId, providerId: provider.id } })
  if (!review) return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 })

  await prisma.review.update({ where: { id: reviewId }, data: { reply: null, repliedAt: null } })
  return NextResponse.json({ success: true })
}
