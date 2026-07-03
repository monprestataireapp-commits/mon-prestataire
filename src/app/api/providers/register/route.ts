import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { slugify } from '@/lib/utils'
import { sendWelcomeEmail, sendAdminNewUserEmail } from '@/lib/email'
import { rateLimit, getIp } from '@/lib/rateLimit'
import { geocodeCity } from '@/lib/geocode'

export async function POST(req: NextRequest) {
  if (!rateLimit(getIp(req), 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de tentatives.' }, { status: 429 })
  }
  try {
    const body = await req.json()
    const {
      email, password, name, businessName, description,
      city, department, departmentCode, region,
      phone, phonePublic, instagramUrl, tiktokUrl, website,
      categories, specialties, yearsExperience,
      hasDelivery, deliveryZone, deliveryFee, hasHandDelivery,
      priceMin, priceMax,
    } = body

    if (!email || !password || !businessName) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const baseSlug = slugify(businessName)
    let slug = baseSlug
    let i = 1
    while (await prisma.provider.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name || businessName,
        password: hashedPassword,
        role: 'PROVIDER',
        provider: {
          create: {
            businessName,
            slug,
            description: description || '',
            city: city || '',
            department: department || '',
            departmentCode: departmentCode || '',
            region: region || '',
            country: 'FR',
            ...await geocodeCity(city, region).then(c => c ? { latitude: c.lat, longitude: c.lng } : {}),
            phone,
            phonePublic: phonePublic || false,
            instagramUrl,
            tiktokUrl,
            website,
            yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
            hasDelivery: hasDelivery || false,
            deliveryZone: deliveryZone || null,
            deliveryFee: deliveryFee || null,
            hasHandDelivery: hasHandDelivery || false,
            priceMin: priceMin ? parseInt(priceMin) : null,
            priceMax: priceMax ? parseInt(priceMax) : null,
            specialties: JSON.stringify(specialties || []),
            isPublished: false,
            subscriptionStatus: 'inactive',
                        referralCode: slug,
                        referredBy: req.cookies.get('ref')?.value || null,
          },
        },
      },
      include: { provider: true },
    })

    // Associer les catégories
    if (categories?.length && user.provider) {
      for (const catSlug of categories) {
        const cat = await prisma.category.findUnique({ where: { slug: catSlug } })
        if (cat) {
          await prisma.providerCategory.create({
            data: { providerId: user.provider.id, categoryId: cat.id },
          })
        }
      }
    }

    const isFoundingMember = user.provider?.isFoundingMember || false
    sendWelcomeEmail(email, name || businessName, isFoundingMember).catch(() => {})
    sendAdminNewUserEmail('provider', name || businessName, email, `<strong>Ville :</strong> ${city || '—'}<br><strong>Activité :</strong> ${businessName}`).catch(() => {})

          // Incrémenter le compteur du parrain
        const refCode = req.cookies.get('ref')?.value
        if (refCode) {
                await prisma.provider.updateMany({
                          where: { referralCode: refCode },
                          data: { referralCount: { increment: 1 }, referralEarnings: { increment: 1 } },
                })
        }

    return NextResponse.json({ success: true, slug: user.provider?.slug })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
