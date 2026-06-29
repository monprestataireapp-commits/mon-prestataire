import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CATEGORIES } from '@/lib/categories'

function isAdmin(session: any) {
  return session?.user?.role === 'ADMIN' || session?.user?.email === process.env.ADMIN_EMAIL
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, emoji: cat.emoji, description: cat.description, imageUrl: cat.image, sortOrder: cat.sortOrder },
      create: { slug: cat.slug, name: cat.name, emoji: cat.emoji, description: cat.description, imageUrl: cat.image, sortOrder: cat.sortOrder },
    })
  }

  return NextResponse.json({ success: true, count: CATEGORIES.length })
}
