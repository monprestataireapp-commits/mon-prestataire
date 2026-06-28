export const metadata = {
  title: 'Politique de Confidentialité',
  description: 'Politique de confidentialité de MonPrestataire — données collectées, utilisation, vos droits RGPD.',
}

export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-cormorant text-4xl font-bold text-white mb-2">Politique de Confidentialité</h1>
      <p className="text-white/40 text-sm mb-8">Dernière mise à jour : juin 2024</p>
      <div className="space-y-8 text-white/70 text-sm leading-relaxed">
        <section>
          <h2 className="font-cormorant text-2xl text-white font-semibold mb-3">Données collectées</h2>
          <p>Nous collectons : email, nom, informations de profil prestataire, données de navigation. Les paiements sont gérés par Stripe et nous n&apos;avons pas accès à vos données bancaires.</p>
        </section>
        <section>
          <h2 className="font-cormorant text-2xl text-white font-semibold mb-3">Utilisation des données</h2>
          <p>Vos données sont utilisées uniquement pour faire fonctionner la plateforme, améliorer nos services et vous contacter en cas de besoin. Nous ne vendons jamais vos données à des tiers.</p>
        </section>
        <section>
          <h2 className="font-cormorant text-2xl text-white font-semibold mb-3">Vos droits</h2>
          <p>Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Contactez-nous à <a href="mailto:contact@mon-prestataire.fr" className="text-rose hover:underline">contact@mon-prestataire.fr</a>.</p>
        </section>
      </div>
    </div>
  )
}

