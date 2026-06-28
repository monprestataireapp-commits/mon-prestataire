import Link from 'next/link'
import { ExternalLink, Music2 } from 'lucide-react'
import { NewsletterBar } from './NewsletterBar'

export function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border mt-20">
      <NewsletterBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <h3 className="font-cormorant text-2xl font-bold text-gradient-rose-gold mb-3">
              MonPrestataire
            </h3>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Le premier moteur de recherche des prestataires indépendants en France.
              Trouvez les meilleurs talents près de chez vous.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-xl bg-dark border border-dark-border flex items-center justify-center text-white/50 hover:text-rose hover:border-rose/30 transition-colors">
                <ExternalLink size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-dark border border-dark-border flex items-center justify-center text-white/50 hover:text-rose hover:border-rose/30 transition-colors">
                <Music2 size={16} />
              </a>
            </div>
          </div>

          {/* Liens prestataires */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Prestataires</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link href="/inscription" className="hover:text-rose transition-colors">S&apos;inscrire</Link></li>
              <li><Link href="/abonnement" className="hover:text-rose transition-colors">Nos formules</Link></li>
              <li><Link href="/dashboard" className="hover:text-rose transition-colors">Mon espace</Link></li>
              <li><Link href="/comment-ca-marche" className="hover:text-rose transition-colors">Comment ça marche</Link></li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Ressources</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link href="/blog" className="hover:text-rose transition-colors">Blog</Link></li>
              <li><Link href="/comment-ca-marche" className="hover:text-rose transition-colors">Comment ça marche</Link></li>
              <li><Link href="/contact" className="hover:text-rose transition-colors">Contact & Support</Link></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Légal</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link href="/cgu" className="hover:text-rose transition-colors">CGU</Link></li>
              <li><Link href="/confidentialite" className="hover:text-rose transition-colors">Confidentialité</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-rose transition-colors">Mentions légales</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} MonPrestataire. Tous droits réservés.
          </p>
          <p className="text-white/20 text-xs">
            Lancement France — Belgique & Suisse bientôt disponibles
          </p>
        </div>
      </div>
    </footer>
  )
}

