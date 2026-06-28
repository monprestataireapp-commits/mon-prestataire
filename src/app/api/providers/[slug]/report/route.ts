import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import { rateLimit } from '@/lib/rateLimit'

const resend = new Resend(process.env.RESEND_API_KEY)

const REASONS: Record<string, string> = {
  fake: 'Faux profil / escroquerie',
  inappropriate: 'Contenu inapproprié',
  spam: 'Spam ou publicité abusive',
  other: 'Autre motif',
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (!rateLimit(`report:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de signalements, réessayez plus tard.' }, { status: 429 })
  }

  const session = await getServerSession(authOptions)
  const { reason, details } = await req.json()

  if (!reason || !REASONS[reason]) {
    return NextResponse.json({ error: 'Motif invalide' }, { status: 400 })
  }

  const provider = await prisma.provider.findUnique({
    where: { slug: params.slug },
    select: { id: true, businessName: true, slug: true },
  })
  if (!provider) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    await resend.emails.send({
      from: `MonPrestataire <noreply@${process.env.RESEND_DOMAIN || 'mon-prestataire.fr'}>`,
      to: adminEmail,
      subject: `🚨 Signalement : ${provider.businessName}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;background:#1A1118;color:#fff;border-radius:16px;padding:24px">
          <h2 style="color:#C8547A;margin:0 0 16px">Signalement de profil</h2>
          <p><strong>Profil :</strong> <a href="${process.env.NEXTAUTH_URL}/prestataire/${provider.slug}" style="color:#C8547A">${provider.businessName}</a></p>
          <p><strong>Motif :</strong> ${REASONS[reason]}</p>
          ${details ? `<p><strong>Détails :</strong> ${details.slice(0, 500)}</p>` : ''}
          <p><strong>Signalé par :</strong> ${session?.user?.email || 'Visiteur anonyme'}</p>
          <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:16px">ID prestataire : ${provider.id}</p>
        </div>
      `,
    }).catch(() => {})
  }

  return NextResponse.json({ success: true })
}
