import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put, del } from '@vercel/blob'

const MAX_SIZE = 50 * 1024 * 1024
const ALLOWED = ['video/mp4', 'video/webm', 'video/quicktime']

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({
    where: { userId },
    select: { id: true, subscriptionPlan: true, _count: { select: { videos: true } } },
  })
  if (!provider) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })

  const maxVideos = provider.subscriptionPlan === 'premium' ? 5 : 2
  if (provider._count.videos >= maxVideos) {
    return NextResponse.json({ error: `Maximum ${maxVideos} vidéos (formule ${provider.subscriptionPlan || 'standard'})` }, { status: 400 })
  }

  const form = await req.formData()
  const file = form.get('video') as File | null
  const caption = (form.get('caption') as string) || ''

  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Format non supporté (MP4, WebM, MOV)' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Fichier trop lourd (max 50 Mo)' }, { status: 400 })

  const ext = file.name.split('.').pop() || 'mp4'
  const filename = `videos/${provider.id}-${Date.now()}.${ext}`
  const blob = await put(filename, file, { access: 'private', addRandomSuffix: true })

  const video = await prisma.providerVideo.create({
    data: { providerId: provider.id, url: blob.url, caption },
  })

  return NextResponse.json({ video })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { videoId } = await req.json()
  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({ where: { userId }, select: { id: true } })
  if (!provider) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })

  const video = await prisma.providerVideo.findFirst({ where: { id: videoId, providerId: provider.id } })
  if (!video) return NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 })

  if (video.url.includes('blob.vercel-storage.com') || video.url.includes('public.blob.vercel-storage.com')) {
    await del(video.url).catch(() => {})
  }

  await prisma.providerVideo.deleteMany({ where: { id: videoId, providerId: provider.id } })
  return NextResponse.json({ success: true })
}
