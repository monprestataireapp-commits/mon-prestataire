import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalProviders,
    activeProviders,
    standardProviders,
    premiumProviders,
    totalClients,
    totalReviews,
    pendingReviews,
    totalDevis,
    newProvidersThisWeek,
    newProvidersThisMonth,
    foundingMembers,
    totalViews,
    newsletterCount,
  ] = await Promise.all([
    prisma.provider.count(),
    prisma.provider.count({ where: { subscriptionStatus: 'active' } }),
    prisma.provider.count({ where: { subscriptionPlan: 'standard', subscriptionStatus: 'active' } }),
    prisma.provider.count({ where: { subscriptionPlan: 'premium', subscriptionStatus: 'active' } }),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.review.count({ where: { isApproved: true } }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.clientRequest.count(),
    prisma.provider.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.provider.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.provider.count({ where: { isFoundingMember: true } }),
    prisma.provider.aggregate({ _sum: { profileViews: true } }),
    prisma.siteConfig.findUnique({ where: { key: 'newsletter_emails' } }),
  ])

  const newsletterEmails = newsletterCount?.value
    ? newsletterCount.value.split(',').filter(Boolean).length
    : 0

  // Revenus estimés (Stripe serait plus précis mais ça donne une idée)
  const estimatedMRR = standardProviders * 4.99 + premiumProviders * 9.99

  return NextResponse.json({
    providers: {
      total: totalProviders,
      active: activeProviders,
      standard: standardProviders,
      premium: premiumProviders,
      foundingMembers,
      newThisWeek: newProvidersThisWeek,
      newThisMonth: newProvidersThisMonth,
    },
    clients: { total: totalClients },
    reviews: { total: totalReviews, pending: pendingReviews },
    devis: { total: totalDevis },
    engagement: {
      totalViews: totalViews._sum.profileViews || 0,
    },
    revenue: {
      estimatedMRR: Math.round(estimatedMRR),
    },
    newsletter: { total: newsletterEmails },
  })
}
