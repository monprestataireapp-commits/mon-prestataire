'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function InscriptionClientPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Erreur lors de l\'inscription')
      setLoading(false)
      return
    }

    await signIn('credentials', { email, password, redirect: false })
    router.push('/espace-client')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-cormorant text-4xl font-bold text-gradient-rose-gold mb-2">Créer un compte</h1>
          <p className="text-white/50 text-sm">Rejoignez MonPrestataire gratuitement</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-2 block">Nom complet</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="input-dark"
                placeholder="Prénom Nom"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="input-dark"
                placeholder="votre@email.fr"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-2 block">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-dark"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-rose text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-border text-center space-y-3">
            <p className="text-white/40 text-sm">
              Déjà un compte ?{' '}
              <Link href="/connexion" className="text-rose hover:underline">Se connecter</Link>
            </p>
            <p className="text-white/30 text-xs">
              Vous êtes prestataire ?{' '}
              <Link href="/inscription" className="text-gold hover:underline">Inscrivez-vous ici</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
