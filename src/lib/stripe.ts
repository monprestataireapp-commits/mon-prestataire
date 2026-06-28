import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PLANS = {
  standard_monthly: {
    priceId: process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID!,
    name: 'Standard Mensuel',
    price: 4.99,
    interval: 'month' as const,
  },
  standard_yearly: {
    priceId: process.env.STRIPE_STANDARD_YEARLY_PRICE_ID!,
    name: 'Standard Annuel',
    price: 49.90,
    interval: 'year' as const,
  },
  premium_monthly: {
    priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
    name: 'Premium Mensuel',
    price: 9.99,
    interval: 'month' as const,
  },
  premium_yearly: {
    priceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
    name: 'Premium Annuel',
    price: 99.90,
    interval: 'year' as const,
  },
}

export const FOUNDING_MEMBER_LIMIT = 100
export const FOUNDING_MEMBER_COUPON = 'LANCEMENT6MOIS'
