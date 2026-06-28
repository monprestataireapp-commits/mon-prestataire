import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminPanel } from '@/components/admin/AdminPanel'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user || (user.role !== 'ADMIN' && user.email !== process.env.ADMIN_EMAIL)) {
    redirect('/')
  }

  return <AdminPanel />
}
