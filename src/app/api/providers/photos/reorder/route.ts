import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/providers/photos/reorder  { order: [id1, id2, ...] }
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { order } = await req.json() as { order: string[] }
  if (!Array.isArray(order) || order.length === 0) {
    return NextResponse.json({ error: 'Ordre invalide' }, { status: 400 })
  }

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({ where: { userId }, select: { id: true } })
  if (!provider) return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })

  // Vérifier que toutes les photos appartiennent bien à ce prestataire
  const photos = await prisma.providerPhoto.findMany({
    where: { id: { in: order }, providerId: provider.id },
    select: { id: true },
  })
  if (photos.length !== order.length) {
    return NextResponse.json({ error: 'Photos non autorisées' }, { status: 403 })
  }

  // Mise à jour en parallèle des sortOrder
  await Promise.all(
    order.map((id, index) =>
      prisma.providerPhoto.update({ where: { id }, data: { sortOrder: index } })
    )
  )

  return NextResponse.json({ success: true })
}
