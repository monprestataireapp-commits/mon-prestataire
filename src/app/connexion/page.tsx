'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ConnexionPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('Email ou mot de passe incorrect')
    } else {
      const session = await getSession()
      const role = (session?.user as any)?.role
      if (role === 'ADMIN') router.push('/admin')
      else if (role === 'PROVIDER') router.push('/dashboard')
      else router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-cormorant text-4xl font-bold text-gradient-rose-gold mb-2">Connexion</h1>
          <p className="text-white/50 text-sm">Accédez à votre espace MonPrestataire</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/50">Mot de passe</label>
                <Link href="/mot-de-passe-oublie" className="text-xs text-white/40 hover:text-rose transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="input-dark"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-rose text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Pas encore de compte ?{' '}
            <Link href="/inscription-client" className="text-rose hover:underline">S&apos;inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

