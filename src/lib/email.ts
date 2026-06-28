import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'MonPrestataire <noreply@mon-prestataire.fr>'
const BASE_URL = process.env.NEXTAUTH_URL || 'https://mon-prestataire.fr'

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${BASE_URL}/reinitialisation?token=${token}`
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Réinitialisation de votre mot de passe — MonPrestataire',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#1A1118;color:#fff;border-radius:16px;padding:32px">
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#C8547A;margin:0 0 8px">MonPrestataire</h1>
        <h2 style="font-size:20px;margin:0 0 16px">Réinitialisation du mot de passe</h2>
        <p style="color:rgba(255,255,255,0.6);line-height:1.6">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous. Ce lien expire dans <strong style="color:#fff">1 heure</strong>.</p>
        <a href="${url}" style="display:inline-block;margin:24px 0;background:#C8547A;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600">
          Réinitialiser mon mot de passe
        </a>
        <p style="color:rgba(255,255,255,0.3);font-size:12px">Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe ne sera pas modifié.</p>
      </div>
    `,
  })
}

export async function sendDevisNotificationEmail(
  providerEmail: string,
  providerName: string,
  clientName: string,
  message: string,
  dashboardUrl: string,
) {
  await resend.emails.send({
    from: FROM,
    to: providerEmail,
    subject: `Nouvelle demande de devis de ${clientName} — MonPrestataire`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#1A1118;color:#fff;border-radius:16px;padding:32px">
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#C8547A;margin:0 0 8px">MonPrestataire</h1>
        <h2 style="font-size:20px;margin:0 0 4px">Nouvelle demande de devis</h2>
        <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0 0 24px">Bonjour ${providerName},</p>
        <div style="background:#231820;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="color:#C9A96E;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Message de ${clientName}</p>
          <p style="color:rgba(255,255,255,0.7);line-height:1.6;margin:0">${message.slice(0, 300)}${message.length > 300 ? '…' : ''}</p>
        </div>
        <a href="${dashboardUrl}" style="display:inline-block;background:#C8547A;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600">
          Voir la demande complète
        </a>
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:24px">Vous recevez cet email car un client a envoyé une demande directement à votre profil MonPrestataire.</p>
      </div>
    `,
  })
}

export async function sendRequestResponseEmail(
  clientEmail: string,
  clientName: string,
  requestTitle: string,
  providerName: string,
  providerSlug: string,
  message: string,
  price: number | null,
) {
  const profileUrl = `${BASE_URL}/prestataire/${providerSlug}`
  const priceHtml = price
    ? `<div style="background:#C9A96E22;border:1px solid #C9A96E44;border-radius:8px;padding:10px 14px;margin:12px 0;color:#C9A96E;font-size:14px">💰 Tarif proposé : <strong>${price} €</strong></div>`
    : ''

  await resend.emails.send({
    from: FROM,
    to: clientEmail,
    subject: `${providerName} a répondu à votre demande — MonPrestataire`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#1A1118;color:#fff;border-radius:16px;padding:32px">
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#C8547A;margin:0 0 8px">MonPrestataire</h1>
        <h2 style="font-size:20px;margin:0 0 4px">Nouveau message d'un prestataire</h2>
        <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0 0 20px">Bonjour ${clientName}, <strong style="color:#fff">${providerName}</strong> a répondu à votre demande « ${requestTitle} ».</p>
        <div style="background:#231820;border-radius:12px;padding:20px;margin-bottom:16px">
          <p style="color:#C9A96E;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Message de ${providerName}</p>
          <p style="color:rgba(255,255,255,0.7);line-height:1.6;margin:0">${message.slice(0, 500)}${message.length > 500 ? '…' : ''}</p>
        </div>
        ${priceHtml}
        <a href="${profileUrl}" style="display:inline-block;background:#C8547A;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600;margin-top:8px">
          Voir le profil de ${providerName}
        </a>
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:24px">Vous pouvez retrouver toutes les réponses dans <a href="${BASE_URL}/mes-demandes" style="color:#C8547A">votre espace demandes</a>.</p>
      </div>
    `,
  })
}

export async function sendVerificationApprovedEmail(email: string, name: string, slug: string) {
  const profileUrl = `${BASE_URL}/prestataire/${slug}`
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '✅ Votre profil est maintenant vérifié — MonPrestataire',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#1A1118;color:#fff;border-radius:16px;padding:32px">
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#C8547A;margin:0 0 8px">MonPrestataire</h1>
        <h2 style="font-size:20px;margin:0 0 16px">Félicitations, ${name} !</h2>
        <div style="background:#C8547A22;border:1px solid #C8547A44;border-radius:12px;padding:16px;margin-bottom:20px">
          <p style="margin:0;color:#fff;font-size:15px">✅ Votre profil a été <strong>vérifié</strong> par notre équipe. Le badge est maintenant visible sur votre profil.</p>
        </div>
        <p style="color:rgba(255,255,255,0.6);line-height:1.6;font-size:14px">
          Ce badge augmente la confiance des clients et améliore votre position dans les résultats de recherche.
        </p>
        <a href="${profileUrl}" style="display:inline-block;background:#C8547A;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600;margin-top:16px">
          Voir mon profil
        </a>
      </div>
    `,
  })
}

export async function sendSubscriptionConfirmEmail(
  email: string,
  name: string,
  plan: string,
  isFoundingMember: boolean,
) {
  const planLabel = plan === 'premium' ? 'Premium — 9,99€/mois' : 'Standard — 4,99€/mois'
  const founderHtml = isFoundingMember
    ? `<div style="background:#C9A96E22;border:1px solid #C9A96E44;border-radius:8px;padding:12px 16px;margin-bottom:20px;color:#C9A96E;font-size:14px">
        ⚡ <strong>Offre fondateur :</strong> vos 6 premiers mois sont offerts ! Votre formule sera activée automatiquement à l'issue de la période gratuite.
       </div>`
    : ''

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `✅ Abonnement activé — MonPrestataire`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#1A1118;color:#fff;border-radius:16px;padding:32px">
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#C8547A;margin:0 0 8px">MonPrestataire</h1>
        <h2 style="font-size:20px;margin:0 0 16px">Votre abonnement est actif !</h2>
        ${founderHtml}
        <p style="color:rgba(255,255,255,0.6);line-height:1.6">Bonjour <strong style="color:#fff">${name}</strong>,<br><br>
        Votre formule <strong style="color:#C8547A">${planLabel}</strong> est maintenant active. Votre profil est visible dans les résultats de recherche.</p>
        <div style="background:#231820;border-radius:12px;padding:16px;margin:20px 0">
          <p style="color:#C9A96E;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Prochaines étapes</p>
          <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;line-height:1.8">
            📸 Ajoutez vos meilleures photos de réalisations<br>
            📝 Complétez votre description et vos tarifs<br>
            📱 Activez votre disponibilité du jour pour apparaître en premier
          </p>
        </div>
        <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#C8547A;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600">
          Accéder à mon tableau de bord
        </a>
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:24px">
          Gérez votre abonnement depuis <a href="${BASE_URL}/dashboard" style="color:#C8547A">votre espace prestataire</a>.
        </p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(email: string, name: string, isFoundingMember: boolean) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: isFoundingMember
      ? '🎉 Bienvenue ! Vous êtes membre fondateur — MonPrestataire'
      : 'Bienvenue sur MonPrestataire !',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#1A1118;color:#fff;border-radius:16px;padding:32px">
        <h1 style="font-family:Georgia,serif;font-size:28px;color:#C8547A;margin:0 0 8px">MonPrestataire</h1>
        ${isFoundingMember ? '<div style="background:#C9A96E22;border:1px solid #C9A96E44;border-radius:8px;padding:12px 16px;margin-bottom:20px;color:#C9A96E;font-size:14px">⚡ Vous faites partie des 100 premiers membres fondateurs — 6 mois offerts !</div>' : ''}
        <h2 style="font-size:20px;margin:0 0 16px">Bienvenue, ${name} !</h2>
        <p style="color:rgba(255,255,255,0.6);line-height:1.6">Votre profil prestataire a bien été créé. Complétez-le pour maximiser vos chances d'être trouvé par des clients.</p>
        <div style="margin:24px 0;space-y:12px">
          <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0 0 8px">✅ Ajoutez vos photos de réalisations<br>✅ Renseignez vos tarifs<br>✅ Décrivez votre activité</p>
        </div>
        <a href="${BASE_URL}/dashboard/modifier" style="display:inline-block;background:#C8547A;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600">
          Compléter mon profil
        </a>
      </div>
    `,
  })
}
