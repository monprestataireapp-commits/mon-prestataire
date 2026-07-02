export const metadata = {
  title: 'Conditions Générales d\'Utilisation',
  description: 'Conditions générales d\'utilisation de MonPrestataire — abonnements, engagements, offre lancement, responsabilités.',
}

export default function CGUPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-cormorant text-4xl font-bold text-white mb-2">Conditions Générales d&apos;Utilisation</h1>
      <p className="text-white/40 text-sm mb-8">Dernière mise à jour : juin 2024</p>

      <div className="prose prose-invert max-w-none space-y-8 text-white/70 text-sm leading-relaxed">
        <section>
          <h2 className="font-cormorant text-2xl text-white font-semibold mb-3">1. Objet</h2>
          <p>MonPrestataire est une marketplace mettant en relation des prestataires indépendants et des clients à la recherche de services. Les présentes CGU régissent l&apos;utilisation de la plateforme.</p>
        </section>

        <section>
          <h2 className="font-cormorant text-2xl text-white font-semibold mb-3">2. Abonnements prestataires</h2>
          <h3 className="text-white font-medium mb-2">Formule Standard — 4,99€/mois ou 49,90€/an</h3>
          <p>L&apos;abonnement mensuel est <strong className="text-white">sans engagement</strong>. La résiliation est possible à tout moment depuis le tableau de bord, sans préavis. Aucun remboursement des mois déjà payés ne sera effectué.</p>
          <p className="mt-2">L&apos;abonnement annuel est <strong className="text-white">non remboursable</strong> et non résiliable en cours d&apos;année.</p>
          <h3 className="text-white font-medium mt-4 mb-2">Formule Premium — 9,99€/mois ou 99,90€/an</h3>
          <p>Les mêmes conditions s&apos;appliquent à la formule Premium.</p>
        </section>

        <section>
          <h2 className="font-cormorant text-2xl text-white font-semibold mb-3">3. Offre Lancement</h2>
          <p>Les 100 premiers prestataires inscrits bénéficient de 6 mois gratuits avant l&apos;activation de leur formule choisie. Cette offre est accordée via un coupon Stripe et est non transférable.</p>
        </section>

        <section>
          <h2 className="font-cormorant text-2xl text-white font-semibold mb-3">4. Publication des profils</h2>
          <p>Tout profil prestataire est soumis à validation par l&apos;équipe MonPrestataire avant publication. MonPrestataire se réserve le droit de refuser ou supprimer tout profil non conforme à ses règles de bonne conduite.</p>
        </section>

        <section>
          <h2 className="font-cormorant text-2xl text-white font-semibold mb-3">5. Responsabilité</h2>
          <p>MonPrestataire est un intermédiaire technique et n&apos;est pas partie aux contrats conclus entre prestataires et clients. MonPrestataire décline toute responsabilité en cas de litige entre utilisateurs.</p>
        </section>

        <section>
          <h2 className="font-cormorant text-2xl text-white font-semibold mb-3">6. Données personnelles</h2>
          <p>Vos données sont traitées conformément à notre <a href="/confidentialite" className="text-rose hover:underline">politique de confidentialité</a> et au RGPD.</p>
        </section>

        <section>
          <h2 className="font-cormorant text-2xl text-white font-semibold mb-3">7. Droit applicable</h2>
          <p>Les présentes CGU sont soumises au droit français. Tout litige sera soumis aux tribunaux compétents de Paris.</p>
        </section>
      </div>
    </div>
  )
}

