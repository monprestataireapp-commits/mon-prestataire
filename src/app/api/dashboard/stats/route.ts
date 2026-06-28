import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({ where: { userId } })
  if (!provider) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })

  // Récupérer les stats des 6 derniers mois depuis ProviderStat
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const rawStats = await prisma.providerStat.findMany({
    where: { providerId: provider.id, date: { gte: sixMonthsAgo } },
    orderBy: { date: 'asc' },
  })

  // Grouper par mois
  const byMonth: Record<string, { views: number; clicks: number; label: string }> = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    byMonth[key] = {
      label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      views: 0,
      clicks: 0,
    }
  }

  for (const s of rawStats) {
    const d = new Date(s.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (byMonth[key]) {
      byMonth[key].views += s.views
      byMonth[key].clicks += s.clicks
    }
  }

  // Si on n'a pas encore de vraies stats, on simule des données progressives
  const hasRealData = rawStats.length > 0
  const statsData = Object.values(byMonth).map((m, i) => {
    if (hasRealData) return m
    // Simulation progressive basée sur les totaux actuels
    return {
      label: m.label,
      views: Math.round(provider.profileViews * (i + 1) / 6 * (0.7 + Math.random() * 0.6)),
      clicks: Math.round(provider.profileClicks * (i + 1) / 6 * (0.7 + Math.random() * 0.6)),
    }
  })

  const pendingReviews = await prisma.review.count({
    where: { providerId: provider.id, isApproved: false },
  })

  const clientRequests = await prisma.clientRequest.count({
    where: {
      isPublished: true,
      OR: [
        { city: { contains: provider.city } },
        { region: { contains: provider.region } },
      ],
    },
  })

  return NextResponse.json({
    stats: statsData,
    pendingReviews,
    clientRequests,
    totalViews: provider.profileViews,
    totalClicks: provider.profileClicks,
    hasRealData,
  })
}
