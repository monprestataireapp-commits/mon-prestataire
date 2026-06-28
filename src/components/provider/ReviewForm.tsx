'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Star } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

export function ReviewForm({ providerId }: { providerId: string }) {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!session) {
    return (
      <p className="text-white/40 text-sm">
        <a href="/connexion" className="text-rose hover:underline">Connectez-vous</a> pour laisser un avis.
      </p>
    )
  }

  if (done) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-sm">
        Merci pour votre avis ! Il sera publié après validation.
      </div>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { setError('Veuillez choisir une note'); return }
    if (comment.length < 10) { setError('Le commentaire est trop court (10 caractères min.)'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erreur'); return }
      setDone(true)
      toast('Avis envoyé ! Il sera publié après validation.', 'success')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs text-white/50 mb-2 block">Note</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
            >
              <Star size={24} className={(hover || rating) >= i ? 'text-gold fill-gold' : 'text-white-border'} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-white/50 mb-2 block">Votre avis</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          placeholder="Partagez votre expérience avec ce prestataire…"
          className="input-dark text-sm resize-none"
        />
      </div>
      {error && <p className="text-rose text-xs">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary text-sm py-2">
        {loading ? 'Envoi…' : 'Publier mon avis'}
      </button>
    </form>
  )
}

