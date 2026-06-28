'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/Toast'

export function FavoriteButton({ providerId }: { providerId: string }) {
  const { data: session } = useSession()
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session) return
    fetch('/api/favorites')
      .then(r => r.json())
      .then(data => {
        const ids = (data.favorites || []).map((f: any) => f.id)
        setFavorited(ids.includes(providerId))
      })
  }, [session, providerId])

  async function toggle() {
    if (!session) { window.location.href = '/connexion'; return }
    setLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      })
      const data = await res.json()
      setFavorited(data.favorited)
      toast(data.favorited ? 'Ajouté aux favoris' : 'Retiré des favoris', data.favorited ? 'success' : 'info')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
        favorited
          ? 'bg-rose border-rose text-white'
          : 'border-dark-border text-white/60 hover:border-rose/40 hover:text-rose'
      )}
    >
      <Heart size={15} fill={favorited ? 'currentColor' : 'none'} />
      {favorited ? 'Sauvegardé' : 'Sauvegarder'}
    </button>
  )
}

