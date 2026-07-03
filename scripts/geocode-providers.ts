import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function geocode(city: string, region?: string | null) {
  const query = [city, region, 'France'].filter(Boolean).join(', ')
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=fr`,
    { headers: { 'User-Agent': 'MonPrestataire/1.0 contact@mon-prestataire.fr' } }
  )
  const data = await res.json() as any[]
  if (!data?.length) return null
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
}

async function main() {
  const providers = await prisma.provider.findMany({
    where: { latitude: null, city: { not: '' } },
    select: { id: true, city: true, region: true, businessName: true },
  })

  console.log(`${providers.length} prestataires à géocoder...`)

  for (const p of providers) {
    const coords = await geocode(p.city, p.region)
    if (coords) {
      await prisma.provider.update({
        where: { id: p.id },
        data: { latitude: coords.lat, longitude: coords.lng },
      })
      console.log(`✅ ${p.businessName} (${p.city}) → ${coords.lat}, ${coords.lng}`)
    } else {
      console.log(`❌ ${p.businessName} (${p.city}) → non trouvé`)
    }
    // Respecter le rate limit Nominatim (1 req/sec)
    await new Promise(r => setTimeout(r, 1100))
  }

  console.log('Terminé !')
  await prisma.$disconnect()
}

main().catch(console.error)
