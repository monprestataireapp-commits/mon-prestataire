/**
 * Script de setup Stripe — crée les produits, prix et coupons automatiquement.
 * Usage : STRIPE_SECRET_KEY=sk_live_xxx npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/stripe-setup.ts
 */

import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY
if (!key) { console.error('❌ STRIPE_SECRET_KEY manquant'); process.exit(1) }

const stripe = new Stripe(key)

async function run() {
  console.log('🚀 Setup Stripe MonPrestataire...\n')

  // ─── Produit Standard ───────────────────────────────────────────────────
  const standard = await stripe.products.create({
    name: 'MonPrestataire Standard',
    description: 'Profil complet, 20 photos, avis clients, visibilité dans les résultats.',
    metadata: { plan: 'standard' },
  })
  console.log(`✅ Produit Standard : ${standard.id}`)

  const stdMonthly = await stripe.prices.create({
    product: standard.id,
    unit_amount: 499,
    currency: 'eur',
    recurring: { interval: 'month' },
    nickname: 'Standard Mensuel',
  })
  const stdYearly = await stripe.prices.create({
    product: standard.id,
    unit_amount: 4990,
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Standard Annuel',
  })
  console.log(`   Prix mensuel  : ${stdMonthly.id}  (4,99 €/mois)`)
  console.log(`   Prix annuel   : ${stdYearly.id}   (49,90 €/an)\n`)

  // ─── Produit Premium ────────────────────────────────────────────────────
  const premium = await stripe.products.create({
    name: 'MonPrestataire Premium',
    description: 'Top des résultats, 50 photos, vidéo, statistiques avancées, badge prioritaire.',
    metadata: { plan: 'premium' },
  })
  console.log(`✅ Produit Premium : ${premium.id}`)

  const preMonthly = await stripe.prices.create({
    product: premium.id,
    unit_amount: 999,
    currency: 'eur',
    recurring: { interval: 'month' },
    nickname: 'Premium Mensuel',
  })
  const preYearly = await stripe.prices.create({
    product: premium.id,
    unit_amount: 9990,
    currency: 'eur',
    recurring: { interval: 'year' },
    nickname: 'Premium Annuel',
  })
  console.log(`   Prix mensuel  : ${preMonthly.id}  (9,99 €/mois)`)
  console.log(`   Prix annuel   : ${preYearly.id}   (99,90 €/an)\n`)

  // ─── Coupon offre lancement : 6 mois gratuits ───────────────────────────
  const coupon = await stripe.coupons.create({
    id: 'LANCEMENT6MOIS',
    name: 'Offre lancement — 6 mois offerts',
    percent_off: 100,
    duration: 'repeating',
    duration_in_months: 6,
    max_redemptions: 100,
    currency: 'eur',
  })
  console.log(`✅ Coupon offre lancement : ${coupon.id}  (100% off × 6 mois, max 100 utilisations)\n`)

  // ─── Résumé à copier dans .env ──────────────────────────────────────────
  console.log('─'.repeat(60))
  console.log('📋 Copiez ces valeurs dans votre .env (ou Vercel → Environment Variables) :')
  console.log('─'.repeat(60))
  console.log(`STRIPE_STANDARD_MONTHLY_PRICE_ID="${stdMonthly.id}"`)
  console.log(`STRIPE_STANDARD_YEARLY_PRICE_ID="${stdYearly.id}"`)
  console.log(`STRIPE_PREMIUM_MONTHLY_PRICE_ID="${preMonthly.id}"`)
  console.log(`STRIPE_PREMIUM_YEARLY_PRICE_ID="${preYearly.id}"`)
  console.log('─'.repeat(60))
  console.log('\n✅ Setup terminé ! Pensez à configurer le webhook Stripe :')
  console.log('   stripe listen --forward-to localhost:3000/api/stripe/webhook')
  console.log('   → En prod : https://dashboard.stripe.com/webhooks → endpoint /api/stripe/webhook')
  console.log('   → Events à écouter : checkout.session.completed, customer.subscription.updated, customer.subscription.deleted\n')
}

run().catch(e => { console.error('❌', e.message); process.exit(1) })
