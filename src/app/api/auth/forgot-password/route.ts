import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimit, getIp } from '@/lib/rateLimit'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  if (!rateLimit(getIp(req), 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de tentatives, réessayez dans 15 minutes.' }, { status: 429 })
  }
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  // Toujours répondre avec succès pour éviter l'énumération d'emails
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ success: true })

  // Supprimer les anciens tokens pour cet email
  await prisma.verificationToken.deleteMany({ where: { identifier: email } })

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  try {
    await sendPasswordResetEmail(email, token)
  } catch (e) {
    console.error('Email reset error:', e)
    // On ne remonte pas l'erreur pour ne pas révéler si Resend est configuré
  }

  return NextResponse.json({ success: true })
}
