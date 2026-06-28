'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) setError('Lien invalide ou expiré.')
  }, [token])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setDone(true)
        setTimeout(() => router.push('/connexion'), 3000)
      } else {
        setError(data.error || 'Lien expiré ou invalide.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center py-8">
        <XCircle size={48} className="text-rose mx-auto mb-4" />
        <p className="text-white/60 text-sm">Lien de réinitialisation invalide.</p>
        <Link href="/mot-de-passe-oublie" className="text-rose hover:underline text-sm mt-4 inline-block">
          Faire une nouvelle demande
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
        <h2 className="font-cormorant text-2xl text-white font-bold mb-2">Mot de passe modifié !</h2>
        <p className="text-white/50 text-sm">Redirection vers la connexion…</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs text-white/50 mb-2 block">Nouveau mot de passe</label>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required minLength={8}
            placeholder="8 caractères minimum"
            className="input-dark pr-10 w-full"
          />
          <button type="button" onClick={() => setShowPwd(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div>
        <label className="text-xs text-white/50 mb-2 block">Confirmer le mot de passe</label>
        <input
          type={showPwd ? 'text' : 'password'}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          placeholder="Répétez le mot de passe"
          className="input-dark w-full"
        />
      </div>
      {error && <p className="text-rose text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Mise à jour…' : 'Changer le mot de passe'}
      </button>
    </form>
  )
}

export default function ReinitialisationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-cormorant text-4xl font-bold text-gradient-rose-gold mb-2">
            Nouveau mot de passe
          </h1>
          <p className="text-white/50 text-sm">Choisissez un mot de passe sécurisé</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sm:p-8">
          <Suspense fallback={<div className="skeleton h-32 rounded-xl" />}>
            <ResetForm />
          </Suspense>
        </div>
        <p className="text-center text-white/30 text-xs mt-6">
          Vous avez retrouvé votre mot de passe ?{' '}
          <Link href="/connexion" className="text-rose hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}

