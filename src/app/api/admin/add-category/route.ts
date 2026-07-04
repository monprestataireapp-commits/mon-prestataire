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

  const { businessName, categorySlug } = await req.json()

  const provider = await prisma.provider.findFirst({
    where: { businessName: { contains: businessName, mode: 'insensitive' } },
    select: { id: true, businessName: true },
  })
  if (!provider) return NextResponse.json({ error: 'Prestataire non trouvé' }, { status: 404 })

  const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
  if (!category) return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })

  const existing = await prisma.providerCategory.findFirst({
    where: { providerId: provider.id, categoryId: category.id },
  })
  if (existing) return NextResponse.json({ message: 'Déjà dans cette catégorie' })

  await prisma.providerCategory.create({
    data: { providerId: provider.id, categoryId: category.id },
  })

  return NextResponse.json({ success: true, message: `${provider.businessName} ajoutée à ${category.name}` })
}
