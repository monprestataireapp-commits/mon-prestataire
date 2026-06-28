import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { EditProfileForm } from '@/components/provider/EditProfileForm'

export const dynamic = 'force-dynamic'

export default async function ModifierProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/connexion')

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({
    where: { userId },
    include: { categories: { include: { category: true } } },
  })
  if (!provider) redirect('/inscription')

  return <EditProfileForm provider={JSON.parse(JSON.stringify(provider))} />
}
