import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendDevisNotificationEmail } from '@/lib/email'
import { rateLimit, getIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  if (!rateLimit(getIp(req), 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de demandes, réessayez plus tard.' }, { status: 429 })
  }
  const { providerId, name, email, phone, eventDate, message, budget } = await req.json()

  if (!providerId || !name || !email || !message) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { id: true, isPublished: true, businessName: true, user: { select: { email: true } } },
  })
  if (!provider || !provider.isPublished) {
    return NextResponse.json({ error: 'Prestataire introuvable' }, { status: 404 })
  }

  await prisma.clientRequest.create({
    data: {
      title: `Demande de devis de ${name}`,
      description: message,
      budget,
      eventDate: eventDate ? new Date(eventDate) : null,
      contactName: name,
      contactEmail: email,
      contactPhone: phone || null,
      isPublished: false,
      targetProviderId: providerId,
    },
  })

  // Notifier le prestataire par email (non bloquant)
  if (provider.user?.email) {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://mon-prestataire.fr'
    sendDevisNotificationEmail(
      provider.user.email,
      provider.businessName,
      name,
      message,
      `${baseUrl}/dashboard`,
    ).catch(() => {})
  }

  return NextResponse.json({ success: true })
}
