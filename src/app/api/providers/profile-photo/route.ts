import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put, del } from '@vercel/blob'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({ where: { userId } })
  if (!provider) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as string) || 'profile' // 'profile' | 'cover'

    if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Format non supporté (JPG, PNG, WebP)' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (5 Mo max)' }, { status: 400 })
    }

    // Supprimer l'ancienne photo si elle existe dans Vercel Blob
    const oldUrl = type === 'cover' ? provider.coverPhoto : provider.profilePhoto
    if (oldUrl && (oldUrl.includes('blob.vercel-storage.com') || oldUrl.includes('public.blob.vercel-storage.com'))) {
      await del(oldUrl).catch(() => {})
    }

    const ext = (file.name || 'photo.jpg').split('.').pop() || 'jpg'
    const filename = `${type === 'cover' ? 'covers' : 'profiles'}/${provider.id}_${Date.now()}.${ext}`
    const blob = await put(filename, file, { access: 'public', addRandomSuffix: true })

    await prisma.provider.update({
      where: { id: provider.id },
      data: type === 'cover' ? { coverPhoto: blob.url } : { profilePhoto: blob.url },
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('Erreur upload photo profil/couverture:', err)
    const message = err instanceof Error ? err.message : 'Erreur upload'
    return NextResponse.json({ error: `Erreur upload : ${message}` }, { status: 500 })
  }
}
