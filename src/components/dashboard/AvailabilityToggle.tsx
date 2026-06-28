'use client'

import { useState } from 'react'
import { CalendarCheck, CalendarX } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

export function AvailabilityToggle({ initial }: { initial: boolean }) {
  const [available, setAvailable] = useState(initial)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch('/api/providers/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailableToday: !available }),
      })
      if (res.ok) {
        setAvailable(v => !v)
        toast(!available ? 'Disponibilité activée ✓' : 'Disponibilité désactivée', !available ? 'success' : 'info')
      } else {
        toast('Erreur lors de la mise à jour', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
        available
          ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
          : 'bg-dark border-dark-border text-white/40 hover:border-white/20 hover:text-white/60'
      }`}
    >
      {available ? <CalendarCheck size={15} /> : <CalendarX size={15} />}
      {loading ? '…' : available ? 'Disponible aujourd\'hui' : 'Marquer disponible'}
    </button>
  )
}

