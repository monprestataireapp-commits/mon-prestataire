import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({ where: { userId } })
  if (!provider) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })

  const body = await req.json()

  // Construire l'objet data uniquement avec les champs présents dans le body
  const data: Record<string, any> = {}

  const stringFields = [
    'businessName', 'description', 'phone', 'instagramUrl', 'tiktokUrl', 'website',
    'city', 'region', 'department', 'departmentCode',
    'responseTime', 'availabilityNotes', 'deliveryZone', 'deliveryFee',
  ]
  for (const f of stringFields) {
    if (f in body) data[f] = body[f]
  }

  const boolFields = ['isAvailableToday', 'hasDelivery', 'hasHandDelivery']
  for (const f of boolFields) {
    if (f in body) data[f] = body[f]
  }

  if ('yearsExperience' in body) data.yearsExperience = body.yearsExperience ? parseInt(body.yearsExperience) : null
  if ('priceMin' in body) data.priceMin = body.priceMin ? parseInt(body.priceMin) : null
  if ('priceMax' in body) data.priceMax = body.priceMax ? parseInt(body.priceMax) : null

  if (Object.keys(data).length > 0) {
    await prisma.provider.update({ where: { id: provider.id }, data })
  }

  // Mettre à jour les catégories si fournies
  if (Array.isArray(body.categories)) {
    await prisma.providerCategory.deleteMany({ where: { providerId: provider.id } })
    for (const catSlug of body.categories) {
      const cat = await prisma.category.findUnique({ where: { slug: catSlug } })
      if (cat) {
        await prisma.providerCategory.create({ data: { providerId: provider.id, categoryId: cat.id } })
      }
    }
  }

  return NextResponse.json({ success: true })
}
