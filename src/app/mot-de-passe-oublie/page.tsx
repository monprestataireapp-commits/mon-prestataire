'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) setDone(true)
      else setError('Une erreur est survenue, réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/connexion" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> Retour à la connexion
        </Link>

        <div className="text-center mb-8">
          <h1 className="font-cormorant text-4xl font-bold text-gradient-rose-gold mb-2">
            Mot de passe oublié
          </h1>
          <p className="text-white/50 text-sm">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sm:p-8">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
              <h2 className="font-cormorant text-2xl text-white font-bold mb-2">Email envoyé !</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Si un compte existe pour <span className="text-white">{email}</span>, vous recevrez un email avec un lien valable <strong className="text-white">1 heure</strong>.
              </p>
              <p className="text-white/30 text-xs">Vérifiez vos spams si vous ne le trouvez pas.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-2 block">Adresse email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="votre@email.fr"
                    className="input-dark pl-9 w-full"
                  />
                </div>
              </div>
              {error && <p className="text-rose text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Envoi…' : 'Envoyer le lien'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

