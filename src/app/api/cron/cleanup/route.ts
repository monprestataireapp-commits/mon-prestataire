import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // Supprimer les sessions expirées
  const sessions = await prisma.session.deleteMany({
    where: { expires: { lt: new Date() } },
  })

  // Supprimer les demandes clients non publiées vieilles de +30j
  const oldRequests = await prisma.clientRequest.deleteMany({
    where: { isPublished: false, updatedAt: { lt: thirtyDaysAgo } },
  })

  return NextResponse.json({
    success: true,
    cleaned: {
      sessions: sessions.count,
      oldRequests: oldRequests.count,
    },
  })
}
