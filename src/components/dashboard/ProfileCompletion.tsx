'use client'

import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Step {
  label: string
  done: boolean
  href?: string
}

interface Props {
  provider: {
    description: string | null
    profilePhoto: string | null
    coverPhoto: string | null
    phone: string | null
    city: string
    website: string | null
    instagramUrl: string | null
    priceMin: number | null
    priceMax: number | null
    yearsExperience: number | null
    responseTime: string | null
    photos: { id: string }[]
    categories: { categoryId: string }[]
    videos: { id: string }[]
  }
}

export function ProfileCompletion({ provider }: Props) {
  const steps: Step[] = [
    { label: 'Description rédigée', done: !!provider.description && provider.description.length >= 100, href: '/dashboard/modifier' },
    { label: 'Photo de profil', done: !!provider.profilePhoto, href: '/dashboard/modifier' },
    { label: 'Photo de couverture', done: !!provider.coverPhoto, href: '/dashboard/modifier' },
    { label: 'Numéro de téléphone', done: !!provider.phone, href: '/dashboard/modifier' },
    { label: 'Catégorie sélectionnée', done: provider.categories.length > 0, href: '/dashboard/modifier' },
    { label: 'Au moins 3 photos dans la galerie', done: provider.photos.length >= 3 },
    { label: 'Tarifs renseignés', done: !!provider.priceMin, href: '/dashboard/modifier' },
    { label: 'Temps de réponse défini', done: !!provider.responseTime, href: '/dashboard/modifier' },
    { label: 'Expérience renseignée', done: !!provider.yearsExperience, href: '/dashboard/modifier' },
    { label: 'Lien Instagram ou site web', done: !!provider.instagramUrl || !!provider.website, href: '/dashboard/modifier' },
  ]

  const done = steps.filter(s => s.done).length
  const total = steps.length
  const pct = Math.round((done / total) * 100)

  if (pct === 100) return null

  const color = pct < 40 ? 'bg-rose' : pct < 70 ? 'bg-gold' : 'bg-green-400'
  const textColor = pct < 40 ? 'text-rose' : pct < 70 ? 'text-gold' : 'text-green-400'
  const remaining = steps.filter(s => !s.done).slice(0, 3)

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-cormorant text-xl font-semibold text-white">Complétion du profil</h2>
        <span className={`font-bold text-lg ${textColor}`}>{pct}%</span>
      </div>

      <div className="w-full bg-dark rounded-full h-2 mb-4">
        <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>

      <p className="text-white/40 text-xs mb-4">
        {done}/{total} étapes complétées. Un profil complet est <span className="text-white/60">3× plus consulté</span>.
      </p>

      <div className="space-y-2">
        {remaining.map(step => (
          <div key={step.label} className="flex items-center gap-2.5 text-sm">
            <Circle size={14} className="text-white/20 shrink-0" />
            {step.href ? (
              <Link href={step.href} className="text-white/50 hover:text-white transition-colors flex items-center gap-1">
                {step.label} <ChevronRight size={12} />
              </Link>
            ) : (
              <span className="text-white/50">{step.label}</span>
            )}
          </div>
        ))}
      </div>

      {steps.filter(s => !s.done).length > 3 && (
        <p className="text-white/30 text-xs mt-2">
          +{steps.filter(s => !s.done).length - 3} autres étapes à compléter
        </p>
      )}
    </div>
  )
}

