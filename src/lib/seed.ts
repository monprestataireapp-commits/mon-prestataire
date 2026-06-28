import { prisma } from './prisma'
import { CATEGORIES } from './categories'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding...')

  // Initialiser le compteur des places fondateurs
  await prisma.siteConfig.upsert({
    where: { key: 'founding_members_count' },
    update: {},
    create: { key: 'founding_members_count', value: '0' },
  })

  // Créer les catégories
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, emoji: cat.emoji, description: cat.description, imageUrl: cat.image, sortOrder: cat.sortOrder },
      create: { slug: cat.slug, name: cat.name, emoji: cat.emoji, description: cat.description, imageUrl: cat.image, sortOrder: cat.sortOrder },
    })
  }
  console.log('✅ Catégories créées')

  // Créer un admin
  const adminPassword = await bcrypt.hash('admin1234', 12)
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@mon-prestataire.fr' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@mon-prestataire.fr',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin créé:', admin.email)

  // Prestataires de démonstration
  const demoProviders = [
    {
      email: 'sophia@demo.fr',
      name: 'Sophia Beauté',
      businessName: 'Sophia Beauté by Laila',
      slug: 'sophia-beaute-laila',
      description: 'Maquilleuse professionnelle spécialisée dans le maquillage de mariée et les looks orientaux. 8 ans d\'expérience à Paris et Île-de-France.',
      city: 'Paris',
      department: 'Paris',
      departmentCode: '75',
      region: 'Île-de-France',
      profilePhoto: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80',
      categories: ['maquillage-beaute', 'mariage'],
      plan: 'premium',
      rating: 4.9,
      reviewCount: 128,
      yearsExperience: 8,
      isAvailableToday: true,
      responseTime: '< 15 min',
      priceMin: 80, priceMax: 350,
    },
    {
      email: 'amira@demo.fr',
      name: 'Amira Events',
      businessName: 'Amira Events Décoration',
      slug: 'amira-events-decoration',
      description: 'Décoratrice événementielle spécialisée dans les mariages orientaux et les soirées de rêve. Toute la France.',
      city: 'Lyon',
      department: 'Rhône',
      departmentCode: '69',
      region: 'Auvergne-Rhône-Alpes',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      categories: ['decoration-events', 'mariage'],
      plan: 'premium',
      rating: 4.8,
      reviewCount: 96,
      priceMin: 200, priceMax: 2000,
      yearsExperience: 5,
      isAvailableToday: false,
      responseTime: '< 1h',
    },
    {
      email: 'nassim@demo.fr',
      name: 'Nassim Photography',
      businessName: 'Nassim Photography',
      slug: 'nassim-photography',
      description: 'Photographe de mariage et portraitiste. Capture les émotions authentiques de vos moments les plus précieux.',
      city: 'Marseille',
      department: 'Bouches-du-Rhône',
      departmentCode: '13',
      region: "Provence-Alpes-Côte d'Azur",
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      categories: ['photographie', 'mariage', 'videaste'],
      plan: 'standard',
      rating: 4.7,
      reviewCount: 74,
      yearsExperience: 6,
      isAvailableToday: true,
      responseTime: '< 24h',
      priceMin: 500, priceMax: 3000,
    },
    {
      email: 'fatima@demo.fr',
      name: 'Fatima Cakes',
      businessName: 'Fatima Cakes & Sucreries',
      slug: 'fatima-cakes',
      description: 'Créatrice de gâteaux personnalisés : wedding cakes, gâteaux d\'anniversaire, cupcakes et macarons artisanaux.',
      city: 'Toulouse',
      department: 'Haute-Garonne',
      departmentCode: '31',
      region: 'Occitanie',
      profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      categories: ['gateaux-sucreries'],
      plan: 'premium',
      rating: 5.0,
      reviewCount: 203,
      yearsExperience: 10,
      isAvailableToday: false,
      responseTime: '< 1h',
      hasDelivery: true,
      deliveryZone: 'region',
      deliveryFee: '10',
      priceMin: 50, priceMax: 400,
    },
    {
      email: 'youssef@demo.fr',
      name: 'DJ Youssef',
      businessName: 'DJ Youssef Oriental & Oriental',
      slug: 'dj-youssef',
      description: 'DJ professionnel spécialisé dans les mariages orientaux et les soirées festives. Mix oriental, rai, chaabi, moderne.',
      city: 'Paris',
      department: 'Paris',
      departmentCode: '75',
      region: 'Île-de-France',
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      categories: ['dj-animation', 'mariage'],
      plan: 'standard',
      rating: 4.6,
      reviewCount: 52,
      yearsExperience: 12,
      isAvailableToday: true,
      responseTime: '< 15 min',
      priceMin: 300, priceMax: 800,
    },
    {
      email: 'nour@demo.fr',
      name: 'Nour Bijoux',
      businessName: 'Nour Créations Bijoux',
      slug: 'nour-creations-bijoux',
      description: 'Créatrice de bijoux artisanaux. Bagues, colliers, bracelets faits à la main avec des matériaux de qualité.',
      city: 'Bordeaux',
      department: 'Gironde',
      departmentCode: '33',
      region: 'Nouvelle-Aquitaine',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      categories: ['bijoux-accessoires', 'artisans-fait-main', 'cadeaux-personnalises'],
      plan: 'standard',
      rating: 4.9,
      reviewCount: 87,
      yearsExperience: 4,
      isAvailableToday: false,
      responseTime: '< 24h',
      hasDelivery: true,
      deliveryZone: 'france',
      deliveryFee: 'gratuit',
      hasHandDelivery: true,
      priceMin: 15, priceMax: 150,
    },
  ]

  for (const demo of demoProviders) {
    const password = await bcrypt.hash('demo1234', 12)
    const user = await prisma.user.upsert({
      where: { email: demo.email },
      update: {},
      create: {
        email: demo.email,
        name: demo.name,
        password,
        role: 'PROVIDER',
      },
    })

    const providerData = {
      userId: user.id,
      businessName: demo.businessName,
      slug: demo.slug,
      description: demo.description,
      profilePhoto: demo.profilePhoto,
      city: demo.city,
      department: demo.department,
      departmentCode: demo.departmentCode,
      region: demo.region,
      country: 'FR',
      subscriptionPlan: demo.plan,
      subscriptionStatus: 'active',
      isVerified: true,
      isPublished: true,
      yearsExperience: demo.yearsExperience,
      isAvailableToday: demo.isAvailableToday,
      responseTime: demo.responseTime,
      hasDelivery: (demo as any).hasDelivery ?? false,
      deliveryZone: (demo as any).deliveryZone ?? null,
      deliveryFee: (demo as any).deliveryFee ?? null,
      hasHandDelivery: (demo as any).hasHandDelivery ?? false,
      priceMin: (demo as any).priceMin ?? null,
      priceMax: (demo as any).priceMax ?? null,
    }

    const provider = await prisma.provider.upsert({
      where: { slug: demo.slug },
      update: providerData,
      create: {
        ...providerData,
        profileViews: Math.floor(Math.random() * 2000) + 100,
        profileClicks: Math.floor(Math.random() * 500) + 20,
      },
    })

    for (const catSlug of demo.categories) {
      const cat = await prisma.category.findUnique({ where: { slug: catSlug } })
      if (cat) {
        await prisma.providerCategory.upsert({
          where: { providerId_categoryId: { providerId: provider.id, categoryId: cat.id } },
          update: {},
          create: { providerId: provider.id, categoryId: cat.id },
        })
      }
    }

    // Ajouter quelques avis de démo
    const reviewUser = await prisma.user.upsert({
      where: { email: `review_${demo.slug}@demo.fr` },
      update: {},
      create: {
        email: `review_${demo.slug}@demo.fr`,
        name: 'Client Satisfait',
        password: await bcrypt.hash('demo1234', 12),
        role: 'CLIENT',
      },
    })
    await prisma.review.upsert({
      where: { id: `review_${demo.slug}` },
      update: {},
      create: {
        id: `review_${demo.slug}`,
        providerId: provider.id,
        userId: reviewUser.id,
        rating: Math.round((demo.rating as number) * 10) / 10 >= 5 ? 5 : 4,
        comment: 'Prestation exceptionnelle ! Je recommande vivement, très professionnel(le) et à l\'écoute. Le résultat a dépassé mes attentes.',
        isApproved: true,
      },
    })

    console.log(`✅ Prestataire: ${demo.businessName}`)
  }

  console.log('🎉 Seed terminé avec succès !')
}

main().catch(console.error).finally(() => prisma.$disconnect())
