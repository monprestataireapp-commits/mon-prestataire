import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { geocodeCity } from '@/lib/geocode'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function isAdmin(session: any) {
  return session?.user?.role === 'ADMIN' || session?.user?.email === process.env.ADMIN_EMAIL
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session)) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const providers = await prisma.provider.findMany({
    where: { latitude: null, city: { not: '' } },
    select: { id: true, city: true, region: true, businessName: true },
  })

  const results: string[] = []

  for (const p of providers) {
    const coords = await geocodeCity(p.city, p.region)
    if (coords) {
      await prisma.provider.update({
        where: { id: p.id },
        data: { latitude: coords.lat, longitude: coords.lng },
      })
      results.push(`✅ ${p.businessName} (${p.city}) → ${coords.lat}, ${coords.lng}`)
    } else {
      results.push(`❌ ${p.businessName} (${p.city}) → non trouvé`)
    }
    await new Promise(r => setTimeout(r, 1100))
  }

  return NextResponse.json({ total: providers.length, results })
}
