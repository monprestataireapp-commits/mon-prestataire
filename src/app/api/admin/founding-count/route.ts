import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function isAdmin(session: any) {
  return session?.user?.role === 'ADMIN' || session?.user?.email === process.env.ADMIN_EMAIL
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { count } = await req.json()
  if (typeof count !== 'number' || count < 0 || count > 100) {
    return NextResponse.json({ error: 'Valeur invalide' }, { status: 400 })
  }

  await prisma.siteConfig.upsert({
    where: { key: 'founding_members_count' },
    update: { value: String(count) },
    create: { key: 'founding_members_count', value: String(count) },
  })

  return NextResponse.json({ success: true })
}
