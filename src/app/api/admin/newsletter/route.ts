import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const config = await prisma.siteConfig.findUnique({ where: { key: 'newsletter_emails' } })
  const emails: string[] = config ? JSON.parse(config.value) : []

  return NextResponse.json({ emails, total: emails.length })
}
