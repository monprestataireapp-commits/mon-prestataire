import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const providers = await prisma.provider.findMany({
    where: {
      isPublished: true,
      subscriptionStatus: { in: ['active', 'trialing'] },
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      slug: true,
      businessName: true,
      city: true,
      profilePhoto: true,
      latitude: true,
      longitude: true,
      isVerified: true,
      categories: {
        include: { category: { select: { slug: true, name: true, emoji: true } } },
        take: 1,
      },
    },
  })

  return NextResponse.json({ providers })
}
