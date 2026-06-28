import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const provider = await prisma.provider.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    })
    if (!provider) return NextResponse.json({ ok: false })

    // Incrémenter les vues globales
    await prisma.provider.update({
      where: { id: provider.id },
      data: { profileViews: { increment: 1 } },
    })

    // Enregistrer la stat du jour
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.providerStat.upsert({
      where: { providerId_date: { providerId: provider.id, date: today } },
      update: { views: { increment: 1 } },
      create: { providerId: provider.id, date: today, views: 1, clicks: 0 },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
