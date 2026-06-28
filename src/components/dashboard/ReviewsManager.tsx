'use client'

import { useState } from 'react'
import { Star, MessageSquare, Send, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'

interface Review {
  id: string
  rating: number
  comment: string
  reply: string | null
  repliedAt: string | null
  createdAt: string
  isApproved: boolean
  user: { name: string | null; email: string | null }
}

interface Props {
  reviews: Review[]
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={12} className={n <= rating ? 'text-gold fill-gold' : 'text-white/20'} />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const [open, setOpen] = useState(false)
  const [reply, setReply] = useState(review.reply || '')
  const [saving, setSaving] = useState(false)
  const [currentReply, setCurrentReply] = useState(review.reply)
  const [currentRepliedAt, setCurrentRepliedAt] = useState(review.repliedAt)

  async function submitReply() {
    if (!reply.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/reviews/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: review.id, reply }),
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentReply(data.review.reply)
        setCurrentRepliedAt(data.review.repliedAt)
        setOpen(false)
        toast('Réponse publiée', 'success')
      } else {
        toast('Erreur lors de la publication', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  async function deleteReply() {
    const res = await fetch(`/api/reviews/reply?reviewId=${review.id}`, { method: 'DELETE' })
    if (res.ok) {
      setCurrentReply(null)
      setCurrentRepliedAt(null)
      setReply('')
      toast('Réponse supprimée', 'info')
    }
  }

  return (
    <div className={`border rounded-xl p-4 ${review.isApproved ? 'border-dark-border' : 'border-yellow-500/20 bg-yellow-500/5'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-white text-sm font-medium">{review.user.name || 'Anonyme'}</p>
          <p className="text-white/30 text-xs">{formatDate(new Date(review.createdAt))}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StarRow rating={review.rating} />
          {!review.isApproved && (
            <span className="text-yellow-400 text-xs bg-yellow-400/10 px-2 py-0.5 rounded-full">En attente d'approbation</span>
          )}
        </div>
      </div>

      <p className="text-white/70 text-sm mb-3">{review.comment}</p>

      {currentReply ? (
        <div className="bg-dark border border-dark-border rounded-lg p-3 mt-2">
          <p className="text-white/40 text-xs mb-1 flex items-center gap-1">
            <MessageSquare size={10} /> Votre réponse
            {currentRepliedAt && <span className="ml-1">· {formatDate(new Date(currentRepliedAt))}</span>}
          </p>
          <p className="text-white/70 text-sm">{currentReply}</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => { setOpen(true); setReply(currentReply) }} className="text-white/40 text-xs hover:text-white transition-colors">
              Modifier
            </button>
            <button onClick={deleteReply} className="text-rose/60 text-xs hover:text-rose transition-colors flex items-center gap-1">
              <Trash2 size={10} /> Supprimer
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-rose transition-colors"
        >
          <MessageSquare size={12} />
          Répondre à cet avis
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      )}

      {open && (
        <div className="mt-3">
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Écrivez votre réponse… (visible sur votre profil public)"
            rows={3}
            className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2 text-white/80 text-sm placeholder:text-white/20 focus:outline-none focus:border-rose/40 resize-none"
            maxLength={600}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-white/20 text-xs">{reply.length}/600</span>
            <div className="flex gap-2">
              <button onClick={() => setOpen(false)} className="text-white/40 text-xs hover:text-white px-3 py-1.5">
                Annuler
              </button>
              <button
                onClick={submitReply}
                disabled={saving || !reply.trim()}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 disabled:opacity-40"
              >
                <Send size={11} />
                {saving ? 'Publication…' : 'Publier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ReviewsManager({ reviews }: Props) {
  if (reviews.length === 0) {
    return (
      <p className="text-white/30 text-sm text-center py-6">
        Aucun avis pour le moment. Vos premiers avis apparaîtront ici.
      </p>
    )
  }

  const approved = reviews.filter(r => r.isApproved)
  const pending = reviews.filter(r => !r.isApproved)

  return (
    <div className="space-y-3">
      {pending.length > 0 && (
        <p className="text-yellow-400/80 text-xs">
          {pending.length} avis en attente de modération — non visibles sur votre profil public.
        </p>
      )}
      {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
    </div>
  )
}

