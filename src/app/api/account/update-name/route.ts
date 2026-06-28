import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { name } = await req.json()
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Nom invalide (2 caractères minimum)' }, { status: 400 })
  }

  const userId = (session.user as any).id
  await prisma.user.update({ where: { id: userId }, data: { name: name.trim() } })

  return NextResponse.json({ success: true })
}
