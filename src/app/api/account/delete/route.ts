import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { password } = await req.json()
  const userId = (session.user as any).id

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } })
  if (!user?.password) return NextResponse.json({ error: 'Impossible de vérifier le mot de passe' }, { status: 400 })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 403 })

  // Cascade : Prisma supprime Provider → ProviderCategory, Photo, Video, Review, Favorite, ProviderStat, RequestResponse
  await prisma.user.delete({ where: { id: userId } })

  return NextResponse.json({ success: true })
}
