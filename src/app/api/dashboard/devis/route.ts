import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({ where: { userId }, select: { id: true } })
  if (!provider) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })

  const devis = await prisma.clientRequest.findMany({
    where: { targetProviderId: provider.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ devis })
}
