'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles, CheckCircle2, ArrowRight, Camera, CreditCard, Settings,
  Star, Zap, Phone, Image as ImageIcon, Package
} from 'lucide-react'

interface Step {
  icon: React.ElementType
  title: string
  desc: string
  action: string
  href: string
  badge?: string
}

const STEPS: Step[] = [
  {
    icon: Zap,
    title: 'Activer votre abonnement',
    desc: 'Choisissez votre formule pour apparaître dans les recherches. Les 100 premiers prestataires ont 6 mois offerts !',
    action: 'Choisir ma formule',
    href: '/abonnement',
    badge: '🎁 6 mois offerts',
  },
  {
    icon: Settings,
    title: 'Compléter votre profil',
    desc: 'Ajoutez votre description, vos coordonnées, votre expérience et vos tarifs. Un profil complet est 3× plus consulté.',
    action: 'Compléter mon profil',
    href: '/dashboard/modifier',
  },
  {
    icon: ImageIcon,
    title: 'Ajouter vos photos',
    desc: 'Montrez votre travail ! Jusqu\'à 20 photos (Standard) ou 50 photos (Premium) pour mettre en valeur votre activité.',
    action: 'Gérer mes photos',
    href: '/dashboard',
  },
  {
    icon: Phone,
    title: 'Renseigner vos contacts',
    desc: 'Votre numéro de téléphone visible par les clients Standard et Premium permet de vous contacter directement.',
    action: 'Modifier les infos',
    href: '/dashboard/modifier',
  },
  {
    icon: Star,
    title: 'Obtenir vos premiers avis',
    desc: 'Invitez vos clients existants à laisser un avis sur votre profil. Les premiers avis boostent considérablement votre visibilité.',
    action: 'Voir mon profil public',
    href: '/dashboard',
  },
]

export default function BienvenuePage() {
  const router = useRouter()
  const [completed, setCompleted] = useState<number[]>([])

  function toggle(i: number) {
    setCompleted(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  const pct = Math.round((completed.length / STEPS.length) * 100)

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose to-gold flex items-center justify-center mx-auto mb-5">
          <Sparkles size={28} className="text-white" />
        </div>
        <h1 className="font-cormorant text-4xl sm:text-5xl font-bold text-white mb-3">
          Bienvenue sur <span className="text-gradient-rose-gold">MonPrestataire</span> !
        </h1>
        <p className="text-white/50 text-base max-w-md mx-auto">
          Votre profil est créé. Suivez ces étapes pour être visible et recevoir vos premiers clients.
        </p>
      </div>

      {/* Barre de progression */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/60 text-sm font-medium">Progression de votre démarrage</p>
          <span className="font-cormorant text-2xl font-bold text-white">{pct}%</span>
        </div>
        <div className="w-full bg-dark rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-rose to-gold transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct === 100 && (
          <p className="text-green-400 text-sm mt-3 flex items-center gap-2">
            <CheckCircle2 size={14} /> Parfait ! Votre profil est prêt à accueillir vos premiers clients.
          </p>
        )}
      </div>

      {/* Étapes */}
      <div className="space-y-3 mb-8">
        {STEPS.map((step, i) => {
          const done = completed.includes(i)
          return (
            <div
              key={i}
              className={`bg-dark-card border rounded-2xl p-5 transition-all ${done ? 'border-green-500/30 bg-green-500/5' : 'border-dark-border'}`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggle(i)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${done ? 'border-green-400 bg-green-400' : 'border-white/20 hover:border-rose/40'}`}
                >
                  {done && <CheckCircle2 size={14} className="text-white fill-current" />}
                </button>

                {/* Icône */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${done ? 'bg-green-400/10' : 'bg-rose/10'}`}>
                  <step.icon size={16} className={done ? 'text-green-400' : 'text-rose'} />
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className={`font-medium text-sm ${done ? 'text-white/40 line-through' : 'text-white'}`}>
                      {step.title}
                    </p>
                    {step.badge && !done && (
                      <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">{step.badge}</span>
                    )}
                  </div>
                  {!done && (
                    <p className="text-white/40 text-xs leading-relaxed mb-3">{step.desc}</p>
                  )}
                  {!done && (
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-1.5 text-sm text-rose hover:text-rose/80 font-medium transition-colors"
                    >
                      {step.action} <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA final */}
      <div className="bg-gradient-to-r from-rose/10 to-gold/10 border border-rose/20 rounded-2xl p-6 text-center">
        <Package size={24} className="text-gold mx-auto mb-3" />
        <h2 className="font-cormorant text-2xl font-bold text-white mb-2">Prêt à commencer ?</h2>
        <p className="text-white/40 text-sm mb-5">
          Accédez à votre tableau de bord pour gérer votre profil et suivre vos statistiques.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="btn-primary flex items-center justify-center gap-2">
            Mon tableau de bord <ArrowRight size={14} />
          </Link>
          <Link href="/abonnement" className="btn-gold flex items-center justify-center gap-2">
            <Zap size={14} /> Activer mon abonnement
          </Link>
        </div>
      </div>
    </div>
  )
}

