import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'founding_members_count' } })
  return NextResponse.json({ count: parseInt(config?.value || '0') })
}
