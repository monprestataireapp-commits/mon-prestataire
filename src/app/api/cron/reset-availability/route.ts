import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Appelé chaque jour à minuit par Vercel Cron (vercel.json)
export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { count } = await prisma.provider.updateMany({
    where: { isAvailableToday: true },
    data: { isAvailableToday: false },
  })

  return NextResponse.json({ reset: count, date: new Date().toISOString() })
}
