import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getIp } from '@/lib/rateLimit'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  if (!rateLimit(`contact:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de messages envoyés. Réessayez dans 1h.' }, { status: 429 })
  }

  const { name, email, subject, message } = await req.json()

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
  }
  if (message.trim().length < 20) {
    return NextResponse.json({ error: 'Le message doit faire au moins 20 caractères.' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.ADMIN_EMAIL!,
      replyTo: email,
      subject: `[Contact] ${subject || 'Nouveau message'} — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C8547A">Nouveau message via MonPrestataire</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;color:#888;font-size:13px">Nom</td><td style="padding:8px;color:#333">${name}</td></tr>
            <tr><td style="padding:8px;color:#888;font-size:13px">Email</td><td style="padding:8px;color:#333"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px;color:#888;font-size:13px">Sujet</td><td style="padding:8px;color:#333">${subject || 'Non précisé'}</td></tr>
          </table>
          <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin-top:16px">
            <p style="margin:0;white-space:pre-wrap;color:#333">${message}</p>
          </div>
        </div>
      `,
    })
  } catch {
    return NextResponse.json({ error: 'Erreur lors de l\'envoi. Réessayez.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
