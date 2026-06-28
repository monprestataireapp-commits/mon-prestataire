import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendVerificationApprovedEmail } from '@/lib/email'

function isAdmin(session: any) {
  return session?.user?.role === 'ADMIN' || session?.user?.email === process.env.ADMIN_EMAIL
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const providers = await prisma.provider.findMany({
    include: {
      user: { select: { email: true, name: true } },
      categories: { include: { category: true } },
      _count: { select: { reviews: true, favorites: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const config = await prisma.siteConfig.findUnique({ where: { key: 'founding_members_count' } })

  return NextResponse.json({ providers, foundingCount: parseInt(config?.value || '0') })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const { providerId, action } = await req.json()

  if (action === 'verify') {
    const p = await prisma.provider.update({
      where: { id: providerId },
      data: { isVerified: true, verificationRequested: false },
      include: { user: { select: { email: true, name: true } } },
    })
    if (p.user.email) {
      sendVerificationApprovedEmail(
        p.user.email,
        p.user.name || p.businessName,
        p.slug,
      ).catch(() => {})
    }
  } else if (action === 'publish') {
    await prisma.provider.update({
      where: { id: providerId },
      data: { isPublished: true },
    })
  } else if (action === 'unpublish') {
    await prisma.provider.update({
      where: { id: providerId },
      data: { isPublished: false },
    })
  } else if (action === 'reject') {
    await prisma.provider.update({
      where: { id: providerId },
      data: { isPublished: false, isVerified: false },
    })
  } else if (action === 'delete') {
    // Supprime le prestataire et l'utilisateur lié (cascade)
    const provider = await prisma.provider.findUnique({ where: { id: providerId }, select: { userId: true } })
    if (provider) {
      await prisma.user.delete({ where: { id: provider.userId } })
    }
  } else if (action === 'note') {
    const { note } = await req.json().catch(() => ({})) as any
    await prisma.provider.update({
      where: { id: providerId },
      data: { adminNotes: note },
    })
  }

  return NextResponse.json({ success: true })
}
