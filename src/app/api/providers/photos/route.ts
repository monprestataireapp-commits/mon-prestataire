import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put, del } from '@vercel/blob'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({ where: { userId } })
  if (!provider) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })

  const photos = await prisma.providerPhoto.findMany({
    where: { providerId: provider.id },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json({ photos })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({ where: { userId } })
  if (!provider) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })

  const maxPhotos = provider.subscriptionPlan === 'premium' ? 50 : 20
  const currentCount = await prisma.providerPhoto.count({ where: { providerId: provider.id } })
  if (currentCount >= maxPhotos) {
    return NextResponse.json({ error: `Limite de ${maxPhotos} photos atteinte pour votre formule` }, { status: 400 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const caption = formData.get('caption') as string || ''

    if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Format non supporté (JPG, PNG, WebP, GIF uniquement)' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (10 Mo maximum)' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `photos/${provider.id}_${Date.now()}.${ext}`
    const blob = await put(filename, file, { access: 'private', addRandomSuffix: true })

    const maxSortOrder = await prisma.providerPhoto.findFirst({
      where: { providerId: provider.id },
      orderBy: { sortOrder: 'desc' },
    })

    const photo = await prisma.providerPhoto.create({
      data: {
        providerId: provider.id,
        url: blob.url,
        caption,
        sortOrder: (maxSortOrder?.sortOrder ?? -1) + 1,
      },
    })

    return NextResponse.json({ photo })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({ where: { userId } })
  if (!provider) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })

  const { photoId } = await req.json()
  const photo = await prisma.providerPhoto.findFirst({ where: { id: photoId, providerId: provider.id } })
  if (!photo) return NextResponse.json({ error: 'Photo introuvable' }, { status: 404 })

  // Supprimer du Blob si c'est une URL Vercel Blob
  if (photo.url.includes('blob.vercel-storage.com') || photo.url.includes('public.blob.vercel-storage.com')) {
    await del(photo.url).catch(() => {})
  }

  await prisma.providerPhoto.delete({ where: { id: photoId } })
  return NextResponse.json({ success: true })
}
