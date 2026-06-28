export const metadata = {
  title: 'Mentions Légales',
  description: 'Mentions légales de MonPrestataire — éditeur, hébergement, paiement sécurisé Stripe.',
}

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-cormorant text-4xl font-bold text-white mb-8">Mentions Légales</h1>
      <div className="space-y-6 text-white/70 text-sm leading-relaxed">
        <div>
          <h2 className="font-cormorant text-2xl text-white font-semibold mb-2">Éditeur</h2>
          <p>MonPrestataire — contact@mon-prestataire.fr</p>
        </div>
        <div>
          <h2 className="font-cormorant text-2xl text-white font-semibold mb-2">Hébergement</h2>
          <p>Vercel Inc. — 340 Pine Street Suite 701, San Francisco, CA 94104, USA</p>
        </div>
        <div>
          <h2 className="font-cormorant text-2xl text-white font-semibold mb-2">Paiement</h2>
          <p>Les paiements sont sécurisés par Stripe. MonPrestataire n&apos;accède pas aux données de carte bancaire.</p>
        </div>
      </div>
    </div>
  )
}

