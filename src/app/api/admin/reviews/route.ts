import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function isAdmin(session: any) {
  return session?.user?.role === 'ADMIN' || session?.user?.email === process.env.ADMIN_EMAIL
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const reviews = await prisma.review.findMany({
    where: { isApproved: false },
    include: {
      user: { select: { name: true, email: true } },
      provider: { select: { businessName: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ reviews })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { reviewId, action } = await req.json()

  if (action === 'approve') {
    await prisma.review.update({ where: { id: reviewId }, data: { isApproved: true } })
  } else if (action === 'reject') {
    await prisma.review.delete({ where: { id: reviewId } })
  }

  return NextResponse.json({ success: true })
}
