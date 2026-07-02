import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendRequestResponseEmail } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({
    where: { userId },
    include: { user: { select: { email: true } } },
  })
  if (!provider) return NextResponse.json({ error: 'Profil prestataire requis' }, { status: 403 })

  const isActive = provider.subscriptionStatus === 'active' || provider.subscriptionStatus === 'trialing'
  if (!isActive) return NextResponse.json({ error: 'Un abonnement actif est requis pour répondre aux demandes' }, { status: 403 })

  const { message, price } = await req.json()
  if (!message) return NextResponse.json({ error: 'Message obligatoire' }, { status: 400 })

  const existing = await prisma.requestResponse.findFirst({
    where: { requestId: params.id, providerId: provider.id },
  })
  if (existing) return NextResponse.json({ error: 'Vous avez déjà répondu à cette demande' }, { status: 400 })

  // Récupérer la demande pour notifier le client
  const clientRequest = await prisma.clientRequest.findUnique({
    where: { id: params.id },
    include: { user: { select: { email: true, name: true } } },
  })
  if (!clientRequest) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })

  const response = await prisma.requestResponse.create({
    data: {
      requestId: params.id,
      providerId: provider.id,
      message,
      price: price ? parseFloat(price) : null,
    },
  })

  // Notifier le client par email (non-bloquant)
  if (clientRequest.user?.email) {
    sendRequestResponseEmail(
      clientRequest.user.email,
      clientRequest.user.name || 'Client',
      clientRequest.title,
      provider.businessName,
      provider.slug,
      message,
      price ? parseFloat(price) : null,
    ).catch(() => {})
  } else if (clientRequest.contactEmail) {
    sendRequestResponseEmail(
      clientRequest.contactEmail,
      clientRequest.contactName || 'Client',
      clientRequest.title,
      provider.businessName,
      provider.slug,
      message,
      price ? parseFloat(price) : null,
    ).catch(() => {})
  }

  return NextResponse.json({ response })
}
