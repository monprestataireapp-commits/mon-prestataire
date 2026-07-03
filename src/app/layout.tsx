import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { Analytics } from '@vercel/analytics/react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: {
    default: 'MonPrestataire — Le premier moteur de recherche des prestataires indépendants',
    template: '%s — MonPrestataire',
  },
  description: 'Trouvez les meilleurs prestataires indépendants près de chez vous : maquillage, photographie, décoration, traiteur, et bien plus encore.',
  keywords: ['prestataire', 'indépendant', 'maquillage', 'photographie', 'mariage', 'événement', 'France', 'traiteur', 'décoration', 'DJ'],
  authors: [{ name: 'MonPrestataire' }],
  creator: 'MonPrestataire',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://mon-prestataire.fr'),
  openGraph: {
    title: 'MonPrestataire — Trouvez votre prestataire idéal',
    description: 'Le premier moteur de recherche des prestataires indépendants en France. Maquillage, photographie, traiteur, DJ, décoration et plus encore.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'MonPrestataire',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MonPrestataire',
    description: 'Le premier moteur de recherche des prestataires indépendants en France.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <Navbar />
          <main className="pb-16 sm:pb-0">{children}</main>
          <Footer />
          <MobileNav />
        </Providers>
        <Analytics />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-NWD05BHL7J" strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-NWD05BHL7J');
        `}</Script>
      </body>
    </html>
  )
}
