import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const userId = (session.user as any).id
  const provider = await prisma.provider.findUnique({
    where: { userId },
    include: { user: { select: { email: true } } },
  })
  if (!provider) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })

  if (provider.isVerified) return NextResponse.json({ error: 'Votre profil est déjà vérifié.' }, { status: 400 })
  if (provider.verificationRequested) return NextResponse.json({ error: 'Une demande est déjà en cours.' }, { status: 400 })

  await prisma.provider.update({
    where: { id: provider.id },
    data: { verificationRequested: true, verificationRequestedAt: new Date() },
  })

  // Notifier l'admin
  resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: process.env.ADMIN_EMAIL!,
    subject: `[Vérification] Demande de ${provider.businessName}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
        <h2 style="color:#C8547A">Nouvelle demande de vérification</h2>
        <p><strong>${provider.businessName}</strong> (${provider.user.email}) demande la vérification de son profil.</p>
        <p>Ville : ${provider.city}, ${provider.region}</p>
        <p>Email prestataire : <a href="mailto:${provider.user.email}">${provider.user.email}</a></p>
        <a href="${process.env.NEXTAUTH_URL}/admin" style="display:inline-block;background:#C8547A;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;margin-top:16px">
          Voir dans l'admin
        </a>
      </div>
    `,
  }).catch(() => {})

  return NextResponse.json({ success: true })
}
