import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'founding_members_count' } })
  return NextResponse.json({ count: parseInt(config?.value || '0') })
}
