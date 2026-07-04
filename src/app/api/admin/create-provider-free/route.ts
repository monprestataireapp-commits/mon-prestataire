import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { geocodeCity } from '@/lib/geocode'

function isAdmin(session: any) {
  return session?.user?.role === 'ADMIN' || session?.user?.email === process.env.ADMIN_EMAIL
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  try {
    const { name, email, password, businessName, country, city, region, months } = await req.json()

    if (!name || !email || !password || !businessName || !city || !region || !months) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const subscriptionEndsAt = new Date()
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + Number(months))

    // Génère un slug unique
    let baseSlug = slugify(businessName)
    let slug = baseSlug
    let i = 1
    while (await prisma.provider.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'PROVIDER',
        provider: {
          create: {
            businessName,
            slug,
            description: `Prestataire indépendant basé à ${city}.`,
            city,
            region,
            department: region,
            country: country || 'FR',
            subscriptionPlan: 'standard',
            subscriptionStatus: 'active',
            subscriptionEndsAt,
            isPublished: true,
            isVerified: false,
            ...await geocodeCity(city, region, country === 'FR' ? undefined : country).then(c => c ? { latitude: c.lat, longitude: c.lng } : {}),
            adminNotes: `Compte créé manuellement par admin — ${months} mois offerts jusqu'au ${subscriptionEndsAt.toLocaleDateString('fr-FR')}`,
          },
        },
      },
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
