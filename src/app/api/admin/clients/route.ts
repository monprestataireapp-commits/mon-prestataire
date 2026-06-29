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

  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { clientRequests: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ clients })
}
