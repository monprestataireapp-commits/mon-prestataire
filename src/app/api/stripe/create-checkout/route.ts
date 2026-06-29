import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, PLANS, FOUNDING_MEMBER_LIMIT } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { planKey } = await req.json()
  const plan = PLANS[planKey as keyof typeof PLANS]
  if (!plan) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({ where: { userId } })
  if (!provider) return NextResponse.json({ error: 'Profil prestataire non trouvé' }, { status: 404 })

  // Vérifier les places fondateurs
  const config = await prisma.siteConfig.findUnique({ where: { key: 'founding_members_count' } })
  const foundingCount = parseInt(config?.value || '0')
  const isFoundingMember = foundingCount < FOUNDING_MEMBER_LIMIT

  let customerId = provider.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      metadata: { userId, providerId: provider.id },
    })
    customerId = customer.id
    await prisma.provider.update({
      where: { id: provider.id },
      data: { stripeCustomerId: customerId },
    })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/abonnement/succes`,
    cancel_url: `${process.env.NEXTAUTH_URL}/abonnement/annulation`,
    metadata: { providerId: provider.id, planKey, isFoundingMember: isFoundingMember ? 'true' : 'false' },
    subscription_data: {
      metadata: { providerId: provider.id, planKey },
      ...(isFoundingMember ? { trial_period_days: 180 } : {}),
    },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
