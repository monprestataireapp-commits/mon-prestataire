'use client'

import { useState } from 'react'
import { ShieldCheck, Clock, CheckCircle2 } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface Props {
  isVerified: boolean
  verificationRequested: boolean
}

export function VerificationRequest({ isVerified, verificationRequested }: Props) {
  const [requested, setRequested] = useState(verificationRequested)
  const [loading, setLoading] = useState(false)

  if (isVerified) {
    return (
      <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 mb-6 flex items-center gap-3">
        <CheckCircle2 size={20} className="text-green-400 shrink-0" />
        <div>
          <p className="text-white font-medium text-sm">Profil vérifié ✅</p>
          <p className="text-white/40 text-xs">Votre badge de vérification est visible sur votre profil public.</p>
        </div>
      </div>
    )
  }

  if (requested) {
    return (
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 mb-6 flex items-center gap-3">
        <Clock size={20} className="text-yellow-400 shrink-0" />
        <div>
          <p className="text-white font-medium text-sm">Vérification en cours</p>
          <p className="text-white/40 text-xs">Notre équipe examine votre demande. Vous serez notifié sous 48-72h.</p>
        </div>
      </div>
    )
  }

  async function requestVerification() {
    setLoading(true)
    try {
      const res = await fetch('/api/providers/verify-request', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast(data.error || 'Erreur', 'error'); return }
      setRequested(true)
      toast('Demande envoyée ! Notre équipe vous contactera sous 48-72h.', 'success')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck size={18} className="text-rose" />
        </div>
        <div className="flex-1">
          <p className="text-white font-medium mb-1">Obtenir le badge Vérifié</p>
          <p className="text-white/40 text-xs leading-relaxed mb-3">
            Le badge ✅ Vérifié augmente votre crédibilité et votre visibilité dans les résultats.
            Notre équipe vérifie votre identité et votre activité professionnelle.
          </p>
          <button
            onClick={requestVerification}
            disabled={loading}
            className="btn-primary text-sm py-2 disabled:opacity-50"
          >
            {loading ? 'Envoi en cours…' : 'Demander la vérification'}
          </button>
        </div>
      </div>
    </div>
  )
}

