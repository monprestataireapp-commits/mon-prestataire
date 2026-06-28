import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import { sendSubscriptionConfirmEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const providerId = session.metadata?.providerId
      const planKey = session.metadata?.planKey || ''
      const isFoundingMember = session.metadata?.isFoundingMember === 'true'
      const plan = planKey.startsWith('premium') ? 'premium' : 'standard'

      if (providerId) {
        await prisma.provider.update({
          where: { id: providerId },
          data: {
            subscriptionPlan: plan,
            subscriptionStatus: 'active',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            isPublished: true,
            isFoundingMember,
          },
        })

        if (isFoundingMember) {
          const config = await prisma.siteConfig.findUnique({ where: { key: 'founding_members_count' } })
          const count = parseInt(config?.value || '0')
          await prisma.siteConfig.upsert({
            where: { key: 'founding_members_count' },
            update: { value: String(count + 1) },
            create: { key: 'founding_members_count', value: String(count + 1) },
          })
        }

        // Email de confirmation d'abonnement
        const updatedProvider = await prisma.provider.findUnique({
          where: { id: providerId },
          include: { user: { select: { email: true, name: true } } },
        })
        if (updatedProvider?.user.email) {
          sendSubscriptionConfirmEmail(
            updatedProvider.user.email,
            updatedProvider.user.name || updatedProvider.businessName,
            plan,
            isFoundingMember,
          ).catch(() => {})
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const providerId = sub.metadata?.providerId
      if (providerId) {
        const isActive = ['active', 'trialing'].includes(sub.status)
        const plan = sub.metadata?.planKey?.startsWith('premium') ? 'premium' : 'standard'
        await prisma.provider.update({
          where: { id: providerId },
          data: {
            subscriptionStatus: sub.status,
            subscriptionPlan: plan,
            isPublished: isActive,
            subscriptionEndsAt: (sub as any).current_period_end
              ? new Date((sub as any).current_period_end * 1000)
              : null,
          },
        })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const providerId = sub.metadata?.providerId
      if (providerId) {
        await prisma.provider.update({
          where: { id: providerId },
          data: {
            subscriptionStatus: 'canceled',
            isPublished: false,
          },
        })
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      if (customerId) {
        await prisma.provider.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscriptionStatus: 'past_due' },
        })
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      if (customerId) {
        // Réactiver si c'était past_due
        await prisma.provider.updateMany({
          where: { stripeCustomerId: customerId, subscriptionStatus: 'past_due' },
          data: { subscriptionStatus: 'active', isPublished: true },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
