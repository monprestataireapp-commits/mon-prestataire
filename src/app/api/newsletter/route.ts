import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Stocke les emails newsletter dans SiteConfig sous forme de liste JSON
export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }

  const key = 'newsletter_emails'
  const config = await prisma.siteConfig.findUnique({ where: { key } })
  const emails: string[] = config ? JSON.parse(config.value) : []

  if (emails.includes(email)) {
    return NextResponse.json({ message: 'Déjà inscrit' })
  }

  emails.push(email)
  await prisma.siteConfig.upsert({
    where: { key },
    update: { value: JSON.stringify(emails) },
    create: { key, value: JSON.stringify(emails) },
  })

  return NextResponse.json({ success: true, total: emails.length })
}
