'use client'

import { useState } from 'react'
import { Bell, Check } from 'lucide-react'

export function NewsletterBar() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="bg-gold/5 border-y border-gold/20 py-3 px-4 text-center flex items-center justify-center gap-2 text-sm text-gold">
        <Check size={15} /> Merci ! Vous serez notifié des nouveaux prestataires près de chez vous.
      </div>
    )
  }

  return (
    <div className="bg-dark-card border-y border-dark-border py-3 px-4">
      <form onSubmit={subscribe} className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 text-white/50 text-sm shrink-0">
          <Bell size={14} className="text-rose" />
          <span>Nouveaux prestataires :</span>
        </div>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="votre@email.fr"
          className="flex-1 bg-dark border border-dark-border text-white text-sm rounded-xl px-3 py-2 placeholder-white/30 focus:outline-none focus:border-rose/50 w-full"
        />
        <button type="submit" disabled={loading}
          className="btn-primary text-sm py-2 px-4 shrink-0 w-full sm:w-auto">
          {loading ? '…' : 'Me notifier'}
        </button>
      </form>
    </div>
  )
}

