import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Trouver Julie
  const providers = await prisma.provider.findMany({
    where: { user: { name: { contains: 'Julie', mode: 'insensitive' } } },
    select: { id: true, businessName: true, slug: true, customPhotoLimit: true, user: { select: { name: true, email: true } } }
  })
  console.log('Prestataires trouvées:', JSON.stringify(providers, null, 2))

  if (providers.length === 1) {
    await prisma.provider.update({
      where: { id: providers[0].id },
      data: { customPhotoLimit: 20 }
    })
    console.log(`✅ Limite photos mise à 20 pour ${providers[0].businessName}`)
  } else {
    console.log('Plusieurs résultats ou aucun — préciser le slug')
  }

  await prisma.$disconnect()
}
main().catch(console.error)
