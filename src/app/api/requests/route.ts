import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 10

  const [requests, total] = await Promise.all([
    prisma.clientRequest.findMany({
      where: { isPublished: true },
      include: {
        user: { select: { name: true } },
        _count: { select: { responses: true } },
        responses: {
          orderBy: { createdAt: 'asc' },
          include: {
            provider: {
              select: { businessName: true, slug: true, profilePhoto: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.clientRequest.count({ where: { isPublished: true } }),
  ])

  return NextResponse.json({ requests, total, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Vous devez être connecté pour publier une demande' }, { status: 401 })

  const body = await req.json()
  const { title, description, categoryId, city, region, budget, eventDate } = body

  if (!title || !description) {
    return NextResponse.json({ error: 'Titre et description obligatoires' }, { status: 400 })
  }

  const request = await prisma.clientRequest.create({
    data: {
      userId: (session.user as any).id,
      title,
      description,
      categoryId: categoryId || null,
      city: city || null,
      region: region || null,
      budget: budget ? parseFloat(budget) : null,
      eventDate: eventDate ? new Date(eventDate) : null,
    },
  })

  return NextResponse.json({ request })
}
