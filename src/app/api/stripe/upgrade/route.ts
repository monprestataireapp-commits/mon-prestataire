import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { billing } = await req.json() as { billing: 'monthly' | 'yearly' }

  const provider = await prisma.provider.findUnique({
    where: { userId: (session.user as any).id },
    select: { id: true, stripeSubscriptionId: true, subscriptionPlan: true },
  })

  if (!provider?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 400 })
  }

  if (provider.subscriptionPlan === 'premium') {
    return NextResponse.json({ error: 'Déjà en Premium' }, { status: 400 })
  }

  const priceId = billing === 'yearly'
    ? process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!
    : process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!

  const subscription = await stripe.subscriptions.retrieve(provider.stripeSubscriptionId)
  const item = subscription.items.data[0]

  await stripe.subscriptions.update(provider.stripeSubscriptionId, {
    items: [{ id: item.id, price: priceId }],
    proration_behavior: 'always_invoice',
  })

  await prisma.provider.update({
    where: { id: provider.id },
    data: { subscriptionPlan: 'premium' },
  })

  return NextResponse.json({ success: true })
}
