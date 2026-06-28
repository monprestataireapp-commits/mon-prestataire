'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Trash2, ArrowLeft } from 'lucide-react'

export default function SupprimerComptePage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    if (confirm !== 'SUPPRIMER') {
      setError('Tapez exactement SUPPRIMER pour confirmer.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (res.ok) {
        await signOut({ redirect: false })
        router.push('/?deleted=1')
      } else {
        setError(data.error || 'Une erreur est survenue.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Retour au tableau de bord
        </Link>

        <div className="bg-dark-card border border-rose/20 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-rose" />
            </div>
            <div>
              <h1 className="font-cormorant text-2xl font-bold text-white">Supprimer mon compte</h1>
              <p className="text-white/40 text-xs">Action irréversible</p>
            </div>
          </div>

          <div className="bg-rose/5 border border-rose/20 rounded-xl p-4 mb-6">
            <p className="text-white/70 text-sm leading-relaxed">
              La suppression de votre compte entraîne la <strong className="text-white">perte définitive</strong> de :
            </p>
            <ul className="text-white/50 text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Votre profil et toutes vos photos</li>
              <li>Vos avis et statistiques</li>
              <li>Votre abonnement en cours (non remboursé)</li>
              <li>Tous vos devis reçus</li>
            </ul>
          </div>

          <form onSubmit={handleDelete} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-2 block">Mot de passe actuel</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Votre mot de passe"
                className="input-dark w-full"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-2 block">
                Tapez <span className="text-rose font-mono font-bold">SUPPRIMER</span> pour confirmer
              </label>
              <input
                type="text"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="SUPPRIMER"
                className="input-dark w-full font-mono"
              />
            </div>
            {error && <p className="text-rose text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || confirm !== 'SUPPRIMER'}
              className="w-full flex items-center justify-center gap-2 bg-rose hover:bg-rose-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
            >
              <Trash2 size={16} />
              {loading ? 'Suppression…' : 'Supprimer définitivement mon compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

